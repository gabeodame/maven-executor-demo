import { io, Socket } from "socket.io-client";
import { getBackEndUrl } from "../util/getbackEndUrl";

import { store } from "../store/redux-toolkit/store";

import {
  cloneFailure,
  cloneSuccess,
} from "../store/redux-toolkit/slices/repoCloneStatusSlice";
import {
  addCloneLog,
  addMavenLog,
} from "../store/redux-toolkit/slices/logSlice";

class SocketService {
  private static instance: SocketService | null = null;
  private socket: Socket;
  private sessionId: string;
  private mavenLogs: string[] = [];
  private cloneLogs: string[] = [];
  private loading = false;
  private subscribers: ((logs: string[], loading: boolean) => void)[] = [];
  private cloneSubscribers: ((logs: string[]) => void)[] = [];
  private isFirstPipelineCommand = true;

  private constructor(sessionId: string) {
    this.sessionId = sessionId;
    const SOCKET_URL = getBackEndUrl();

    console.log(`🔌 Connecting to WebSocket server at ${SOCKET_URL}`);

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      path: "/socket.io/",
      auth: { sessionId },
    });

    this.socket.on("connect", () => console.log("✅ WebSocket connected"));
    this.socket.on("disconnect", () =>
      console.log("❌ WebSocket disconnected")
    );

    // ✅ Avoid multiple event registrations
    this.socket.removeAllListeners("maven-output");
    this.socket.removeAllListeners("clone-log");

    // ✅ Listen for Maven logs
    this.socket.on("maven-output", (data: string) => {
      console.log(`📡 [WebSocket] Maven Output: ${data}`);
      // this.mavenLogs.push(data);
      store.dispatch(addMavenLog(data));

      if (data.includes("BUILD SUCCESS") || data.includes("BUILD FAILURE")) {
        this.setLoading(false);
      }

      this.notifySubscribers();
    });

    // ✅ Listen for Clone logs (Structured Jenkins-style)
    this.socket.on("clone-log", (data: string) => {
      const formattedLog = `[CLONE] ${new Date().toLocaleTimeString()} ➜ ${data}`;
      console.log(`📡 [WebSocket] Clone Log: ${formattedLog}`);
      // this.cloneLogs.push(formattedLog);
      store.dispatch(addCloneLog(formattedLog));
      // if (data.includes("✅ Repository cloned successfully")) {
      //   store.dispatch(cloneSuccess());
      // } else if (data.includes("❌ ERROR")) {
      //   store.dispatch(cloneFailure(data));
      // }
      this.notifyCloneSubscribers();
    });

    // ✅ Listen for Clone Status updates
    this.socket.on(
      "repo-clone-status",
      (data: { success: boolean; repoPath?: string; error?: string }) => {
        if (data.success) {
          console.log(
            `🎉 Clone completed successfully. Repo Path: ${data.repoPath}`
          );
          store.dispatch(
            data.success
              ? cloneSuccess()
              : cloneFailure(data.error || "Unknown error")
          );
        } else {
          console.error(`❌ Clone failed: ${data.error}`);
          this.cloneLogs.push(`❌ Clone failed: ${data.error}`);
        }

        this.notifyCloneSubscribers();
      }
    );
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
  public isFirstPipelineRun(): boolean {
    return this.isFirstPipelineCommand;
  }

  public resetPipelineState(): void {
    this.isFirstPipelineCommand = true;
  }

  // ✅ Singleton pattern: Ensures only one instance per session
  public static getInstance(sessionId: string): SocketService {
    if (!this.instance || this.instance.sessionId !== sessionId) {
      this.instance = new SocketService(sessionId);
    }
    return this.instance;
  }

  public subscribe(
    callback: (logs: string[], loading: boolean) => void
  ): () => void {
    this.subscribers.push(callback);
    callback([...this.mavenLogs], this.loading);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  public subscribeCloneLogs(callback: (logs: string[]) => void): () => void {
    this.cloneSubscribers.push(callback);
    callback([...this.cloneLogs]);
    return () => {
      this.cloneSubscribers = this.cloneSubscribers.filter(
        (sub) => sub !== callback
      );
    };
  }

  public clearLogs() {
    console.log("⚙️ Clearing Maven logs...");
    this.mavenLogs = [];
    this.notifySubscribers();
  }

  public clearCloneLogs() {
    console.log("⚙️ Clearing Clone logs...");
    this.cloneLogs = [];
    this.notifyCloneSubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) =>
      callback([...this.mavenLogs], this.loading)
    );
  }

  private notifyCloneSubscribers() {
    this.cloneSubscribers.forEach((callback) => callback([...this.cloneLogs]));
  }

  private setLoading(state: boolean) {
    this.loading = state;
    this.notifySubscribers();
  }

  // ✅ Execute Maven Command
  public runMavenCommand(command: string, type?: "pipeline" | "normal") {
    console.log(`🔧 Running Maven Command: ${command}`);

    if (!this.sessionId) {
      console.error("❌ ERROR: No session ID available!");
      return;
    }
    if (this.loading) {
      console.warn(
        "⏳ Skipping duplicate command execution, still processing..."
      );
      return;
    }

    // ✅ Always clear logs for a fresh start unless in a pipeline sequence
    if (type === "pipeline") {
      if (this.isFirstPipelineCommand) {
        this.clearLogs();
        this.isFirstPipelineCommand = false;
      }
    } else {
      this.clearLogs();
      this.clearCloneLogs();
      this.isFirstPipelineCommand = true;
    }
    store.dispatch(addMavenLog(`▶️ [CLIENT] Sending command: mvn ${command}`));
    // this.mavenLogs.push(`▶️ [CLIENT] Sending command: mvn ${command}`);
    this.setLoading(true);
    this.socket.emit("run-maven-command", command);
  }

  public subscribeCloneStatus(
    callback: (status: {
      success: boolean;
      repoPath?: string;
      error?: string;
    }) => void
  ): () => void {
    const handler = (data: {
      success: boolean;
      repoPath?: string;
      error?: string;
    }) => {
      callback(data);
    };

    this.socket.on("repo-clone-status", handler);

    return () => {
      this.socket.off("repo-clone-status", handler);
    };
  }

  // ✅ Clone Repository via WebSocket (Jenkins-style logs)
  public triggerCloneRepo(
    repoUrl: string,
    branch: string,
    projectName?: string,
    repoPath?: string,
    pomPath?: string
  ) {
    if (!this.socket) {
      console.error("❌ ERROR: WebSocket instance is missing!");
      return;
    }

    if (!this.socket.connected) {
      console.error(
        "⚠️ WebSocket is not connected. Cannot emit clone request."
      );
      return;
    }

    console.log(
      `▶️ [CLIENT] Cloning repository: ${repoUrl} on branch: ${branch}`
    );

    this.clearCloneLogs(); // ✅ Clears previous logs before starting

    // ✅ Structured log output (Jenkins-style)
    store.dispatch(addCloneLog(`🛠️ Cloning repository: ${repoUrl}`));
    store.dispatch(addCloneLog(`🔄 Checking out branch: ${branch}`));
    store.dispatch(
      addCloneLog(
        `📌 Git Command: git clone --branch ${branch} --depth=1 ${repoUrl}`
      )
    );

    if (repoPath) {
      store.dispatch(addCloneLog(`📂 Target Subdirectory: ${repoPath}`));
    }

    if (pomPath) {
      store.dispatch(addCloneLog(`📄 Custom pom.xml Path: ${pomPath}`));
    }

    this.notifyCloneSubscribers(); // ✅ Notifies UI of initial clone logs

    // ✅ Send WebSocket event to backend
    this.socket.emit("clone-repo", {
      repoUrl,
      branch,
      projectName,
      repoPath,
      pomPath,
    });

    // ✅ Add final pending log to indicate process is ongoing
    store.dispatch(addMavenLog("⏳ Cloning in progress..."));
    this.notifyCloneSubscribers();
  }
}

export default SocketService;
