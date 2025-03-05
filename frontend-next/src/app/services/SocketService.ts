import { io, Socket } from "socket.io-client";

class SocketService {
  private static instance: SocketService | null = null;
  private socket: Socket | null = null;
  private sessionId: string;
  private listenersAdded = false;
  private logs: string[] = [];
  private loading = false;
  private subscribers: ((logs: string[], loading: boolean) => void)[] = [];

  private constructor(sessionId: string) {
    this.sessionId = sessionId;
    const isDev = process.env.NODE_ENV === "development";
    const SOCKET_URL = isDev
      ? process.env.NEXT_PUBLIC_DEV_URL
      : process.env.NEXT_PUBLIC_VITE_API_URL!;

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: { sessionId },
    });

    if (!this.listenersAdded) {
      this.socket.on("maven-output", (data: string) => {
        this.logs.push(data);
        if (data.includes("BUILD SUCCESS") || data.includes("BUILD FAILURE")) {
          this.setLoading(false);
        }
        this.notifySubscribers();
      });

      this.socket.on("connect", () => console.log("✅ WebSocket connected"));
      this.socket.on("disconnect", () =>
        console.log("❌ WebSocket disconnected")
      );

      this.listenersAdded = true;
    }
  }

  public static getInstance(sessionId: string): SocketService {
    if (
      !SocketService.instance ||
      SocketService.instance.sessionId !== sessionId
    ) {
      SocketService.instance = new SocketService(sessionId);
    }
    return SocketService.instance;
  }

  public subscribe(
    callback: (logs: string[], loading: boolean) => void
  ): () => void {
    this.subscribers.push(callback);
    callback(this.logs, this.loading);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) =>
      callback([...this.logs], this.loading)
    );
  }

  private setLoading(state: boolean) {
    this.loading = state;
    this.notifySubscribers();
  }

  private clearLogs() {
    console.log("⚙️ Initializing console...");
    this.logs = [];
    this.notifySubscribers();
  }

  public getLogs(): string[] {
    return this.logs;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  private isFirstPipelineCommand = true; // Track first command in a pipeline

  public runMavenCommand(command: string, type?: string) {
    console.log("🔧 Running Maven Command before sessionId check:", command);

    if (!this.sessionId) {
      console.error("❌ ERROR: No session ID available!");
      return;
    }

    // ✅ Handle logs clearing logic
    if (type === "pipeline") {
      if (this.isFirstPipelineCommand) {
        this.clearLogs(); // Clear logs only for the first command in a pipeline
        this.isFirstPipelineCommand = false; // Mark subsequent commands as non-first
      }
    } else {
      this.clearLogs(); // Always clear logs for non-pipeline commands
      this.isFirstPipelineCommand = true; // Reset flag when switching to normal commands
    }

    this.logs.push(`▶️ [CLIENT] Sending command: mvn ${command}`);

    this.setLoading(true);
    this.socket?.emit("run-maven", command);
  }
}

export default SocketService;
