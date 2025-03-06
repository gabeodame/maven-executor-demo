import { useEffect, useState } from "react";
import SocketService from "../services/SocketService";

import { useSession } from "next-auth/react";
import { useSessionCache } from "../store/SessionProvider";

export const useSocket = () => {
  const { sessionId: cachedSessionId } = useSessionCache() || { sessionId: "" };
  const { data: session } = useSession();
  const sessionId = session?.user?.id || cachedSessionId; // Use authenticated session or guest session

  const [socketService, setSocketService] = useState<SocketService | null>(
    null
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId || sessionId.trim() === "") {
      console.warn(
        "⚠️ useSocket: No session ID available! Skipping WebSocket initialization."
      );
      return;
    }

    console.log("🔌 useSocket: Initializing WebSocket for session:", sessionId);

    const newSocketService = SocketService.getInstance(sessionId);
    setSocketService(newSocketService);
    setIsConnected(true);

    // Subscribe to WebSocket logs and loading state
    const unsubscribe = newSocketService.subscribe((newLogs, isLoading) => {
      setLogs(newLogs);
      setLoading(isLoading);
    });

    return () => {
      console.log(
        "🔌 useSocket: Cleaning up WebSocket for session:",
        sessionId
      );
      unsubscribe();
      setSocketService(null);
      setIsConnected(false);
    };
  }, [sessionId]);

  // ✅ Ensure runMavenCommand does nothing if WebSocket is not connected
  const runMavenCommand = (cmd: string, type?: string) => {
    if (!socketService || !isConnected) {
      console.warn(
        "⚠️ useSocket: Cannot send command, WebSocket is not connected."
      );
      return;
    }
    console.log(
      `▶️ [CLIENT] Sending command: mvn ${cmd} | Session ID: ${sessionId}`
    );
    socketService.runMavenCommand(cmd, type);
  };

  return {
    logs,
    loading,
    runMavenCommand,
    isConnected,
  };
};
