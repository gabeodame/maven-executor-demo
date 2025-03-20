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
  clearCloneLogs,
  clearMavenLogs,
} from "../store/redux-toolkit/slices/logSlice";

class SocketService {
  private static instance: SocketService | null = null;
  private socket: Socket;
  private sessionId: string;
  private loading = false;
  private isFirstPipelineCommand = true;
  private subscribers: ((logs: string[], loading: boolean) => void)[] = [];
  private cloneSubscribers: ((logs: string[]) => void)[] = [];

  private logBuffer: string[] = [];
  private cloneLogBuffer: string[] = [];
  private logTimeout: NodeJS.Timeout | null = null;
  private cloneLogTimeout: NodeJS.Timeout | null = null;
  private hasAttachedListeners = false;

  private constructor(sessionId: string) {
    this.sessionId = sessionId;
    const SOCKET_URL = getBackEndUrl();

    console.log(`🔌 Connecting to WebSocket server at ${SOCKET_URL}`);

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      path: "/socket.io/",
      auth: { sessionId },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (this.hasAttachedListeners) return;
    this.hasAttachedListeners = true;

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
    });

    // ✅ Listen for Maven logs (Direct Dispatch)
    this.socket.on("maven-output", (data: string) => {
      console.log(`📡 [WebSocket] Maven Output: ${data}`);

      // ✅ Dispatch log immediately to Redux (avoid buffer)
      store.dispatch(addMavenLog(data));

      if (data.includes("BUILD SUCCESS") || data.includes("BUILD FAILURE")) {
        this.setLoading(false);
      }
    });

    // ✅ Listen for Clone logs (Direct Dispatch)
    this.socket.on("clone-log", (data: string) => {
      // ✅ Prevent logging false success messages
      if (
        data.includes("✅ Repository cloned successfully") &&
        data.includes("null")
      ) {
        console.warn("⚠️ Ignoring misleading success log.");
        return; // ✅ Skip this misleading log
      }

      const formattedLog = `[CLONE] ${new Date().toLocaleTimeString()} ➜ ${data}`;
      console.log(`📡 [WebSocket] Clone Log: ${formattedLog}`);

      store.dispatch(addCloneLog(formattedLog));
    });

    // ✅ Listen for Clone Status updates
    this.socket.on("repo-clone-status", (data) => {
      console.log(`📡 [WebSocket] Clone Status: ${JSON.stringify(data)}`);
      if (!data.success || !data.repoPath) {
        console.error(`❌ Clone failed: ${data.error}`);
        store.dispatch(cloneFailure(data.error || "Unknown error"));
        return; // ✅ Exit early on failure
      }

      console.log(
        `🎉 Clone completed successfully. Repo Path: ${data.repoPath}`
      );
      store.dispatch(cloneSuccess());
    });
  }

  private setLoading(state: boolean) {
    if (this.loading !== state) {
      this.loading = state;
      this.notifySubscribers();
    }
  }

  public notifySubscribers() {
    this.subscribers.forEach((callback) =>
      callback([...this.logBuffer], this.loading)
    );
  }

  public notifyCloneSubscribers() {
    this.cloneSubscribers.forEach((callback) =>
      callback([...this.cloneLogBuffer])
    );
  }

  public static getInstance(sessionId: string): SocketService {
    if (!this.instance || this.instance.sessionId !== sessionId) {
      this.instance = new SocketService(sessionId);
    }
    return this.instance;
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

  public subscribe(
    callback: (logs: string[], loading: boolean) => void
  ): () => void {
    this.subscribers.push(callback);
    callback([...this.logBuffer], this.loading);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  public subscribeCloneLogs(callback: (logs: string[]) => void): () => void {
    this.cloneSubscribers.push(callback);
    callback([...this.cloneLogBuffer]);
    return () => {
      this.cloneSubscribers = this.cloneSubscribers.filter(
        (sub) => sub !== callback
      );
    };
  }

  public subscribeCloneStatus(
    callback: (data: {
      success: boolean;
      repoPath?: string;
      error?: string;
    }) => void
  ): () => void {
    // ✅ Remove existing event listener before adding a new one
    this.socket.off("repo-clone-status");

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

  public clearLogs() {
    console.log("⚙️ Clearing Maven logs...");
    this.logBuffer = [];
    store.dispatch(clearMavenLogs());
    this.notifySubscribers();
  }

  public clearCloneLogs() {
    console.log("⚙️ Clearing Clone logs...");
    this.cloneLogBuffer = [];
    store.dispatch(clearCloneLogs());
    this.notifyCloneSubscribers();
  }

  public triggerCloneRepo(
    repoUrl: string,
    branch: string,
    projectName?: string,
    repoPath?: string,
    pomPath?: string
  ) {
    if (!this.socket.connected) {
      console.error(
        "⚠️ WebSocket is not connected. Cannot emit clone request."
      );
      return;
    }

    console.log(`▶️ [CLIENT] Cloning: ${repoUrl} | Branch: ${branch}`);

    if (!this.loading) {
      this.clearCloneLogs();
    }

    store.dispatch(addCloneLog(`🛠️ Cloning repository: ${repoUrl}`));
    store.dispatch(addCloneLog(`🔄 Checking out branch: ${branch}`));
    this.socket.emit("clone-repo", {
      repoUrl,
      branch,
      projectName,
      repoPath,
      pomPath,
    });
    store.dispatch(addMavenLog("⏳ Cloning in progress..."));
  }

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

    if (type === "pipeline" && this.isFirstPipelineCommand) {
      this.clearLogs();
      this.isFirstPipelineCommand = false;
    } else {
      this.clearLogs();
      this.clearCloneLogs();
      this.isFirstPipelineCommand = true;
    }

    store.dispatch(addMavenLog(`▶️ [CLIENT] Sending command: mvn ${command}`));
    this.setLoading(true);
    this.socket.emit("run-maven-command", command);
  }
}

export default SocketService;
