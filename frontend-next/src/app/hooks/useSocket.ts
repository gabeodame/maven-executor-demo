import { useEffect, useState } from "react";
import SocketService from "../services/SocketService";
import { useSession } from "next-auth/react";
import { useSessionCache } from "../store/SessionProvider";

export const useSocket = () => {
  const { sessionId: cachedSessionId } = useSessionCache() || { sessionId: "" };
  const { data: session } = useSession();
  const sessionId = session?.user?.id || cachedSessionId;

  const [socketService, setSocketService] = useState<SocketService | null>(
    null
  );
  const [mavenLogs, setMavenLogs] = useState<string[]>([]);
  const [cloneLogs, setCloneLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [commandCompleted, setCommandCompleted] = useState(false);

  useEffect(() => {
    if (!sessionId || sessionId.trim() === "") {
      console.warn(
        "⚠️ useSocket: No session ID available! Skipping WebSocket."
      );
      return;
    }

    console.log("🔌 useSocket: Initializing WebSocket for session:", sessionId);

    const newSocketService = SocketService.getInstance(sessionId);
    setSocketService(newSocketService);
    setIsConnected(true);

    // ✅ Subscribe to Maven logs
    const unsubscribeMaven = newSocketService.subscribe(
      (newLogs, isLoading) => {
        setMavenLogs((prevLogs) => [
          ...prevLogs,
          ...newLogs.filter((log) => !prevLogs.includes(log)),
        ]);
        setLoading(isLoading);
        if (!isLoading) setCommandCompleted((prev) => !prev);
      }
    );

    // ✅ Subscribe to Clone logs
    const unsubscribeClone = newSocketService.subscribeCloneLogs((newLogs) => {
      console.log("📡 [Clone Process Log Update]", newLogs);
      setCloneLogs((prevLogs) => [
        ...prevLogs,
        ...newLogs.filter((log) => !prevLogs.includes(log)),
      ]);
    });

    return () => {
      console.log(
        "🔌 useSocket: Cleaning up WebSocket for session:",
        sessionId
      );
      unsubscribeMaven();
      unsubscribeClone();
      setSocketService(null);
      setIsConnected(false);
    };
  }, [sessionId]);

  // ✅ Function to run Maven command
  const runMavenCommand = (cmd: string, type?: "pipeline" | "normal") => {
    if (!socketService || !isConnected) {
      console.warn(
        "⚠️ useSocket: Cannot send command, WebSocket is not connected."
      );
      return;
    }
    console.log(
      `▶️ [CLIENT] Sending command: mvn ${cmd} | Session ID: ${sessionId}`
    );
    setCommandCompleted(false);
    socketService.runMavenCommand(cmd, type);
  };

  // ✅ Function to trigger repository clone
  const triggerClone = async (
    repoUrl: string,
    branch: string,
    projectName?: string,
    repoPath?: string,
    pomPath?: string
  ): Promise<void> => {
    if (!socketService || !isConnected) {
      console.warn(
        "⚠️ useSocket: Cannot send clone request, WebSocket is not connected."
      );
      return Promise.reject(new Error("WebSocket is not connected."));
    }

    console.log(
      `▶️ [CLIENT] Triggering repository clone: ${repoUrl} | Branch: ${branch}`
    );
    setCloneLogs([]); // ✅ Clear previous logs before starting

    return new Promise<void>((resolve, reject) => {
      let hasCompleted = false;

      // ✅ Define `handleCloneLog` first
      const handleCloneLog = (log: string) => {
        console.log("📡 [Clone Log]", log);
        setCloneLogs((prevLogs) => [...prevLogs, log]);

        if (!hasCompleted) {
          if (log.includes("✅ Repository cloned successfully")) {
            console.log("🎉 Clone operation successful!");
            hasCompleted = true; // ✅ Mark as completed
            unsubscribeClone(); // ✅ Unsubscribe WebSocket
            resolve();
          } else if (log.includes("❌ ERROR")) {
            console.error("❌ Clone operation failed!", log);
            hasCompleted = true; // ✅ Mark as completed
            unsubscribeClone();
            reject(new Error(log));
          }
        }
      };

      // ✅ Subscribe AFTER defining `handleCloneLog`
      const unsubscribeClone = socketService.subscribeCloneLogs((newLogs) => {
        newLogs.forEach(handleCloneLog);
      });

      // ✅ Use `getSocket()` to validate WebSocket
      const socket = socketService.getSocket();
      if (socket) {
        socketService.triggerCloneRepo(
          repoUrl,
          branch,
          projectName,
          repoPath,
          pomPath
        );
      } else {
        console.error("❌ ERROR: Socket connection is missing or invalid.");
        unsubscribeClone();
        reject(new Error("WebSocket connection is unavailable."));
      }

      // ✅ Timeout after 30s if no success/failure message is received
      setTimeout(() => {
        if (!hasCompleted) {
          console.error("⏳ Clone operation timed out.");
          unsubscribeClone();
          reject(new Error("Clone operation timed out."));
        }
      }, 30000);
    });
  };

  return {
    mavenLogs,
    cloneLogs,
    loading,
    isConnected,
    runMavenCommand,
    triggerClone,
    commandCompleted,
  };
};
