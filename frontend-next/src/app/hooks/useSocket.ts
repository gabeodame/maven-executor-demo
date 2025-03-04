import { useEffect, useState } from "react";
import SocketService from "../services/SocketService";
import { useSessionCache } from "../hooks/useSessionCache";

export const useSocket = () => {
  const sessionId = useSessionCache(); // ✅ Use cached session ID

  // ✅ Prevent initializing WebSocket without a session ID
  const [socketService, setSocketService] = useState<SocketService | null>(
    null
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionId) return; // Wait until sessionId is available

    console.log("🔗 Initializing WebSocket with Session ID:", sessionId);
    const newSocketService = SocketService.getInstance(sessionId);
    setSocketService(newSocketService);

    const unsubscribe = newSocketService.subscribe((newLogs, isLoading) => {
      setLogs(newLogs);
      setLoading(isLoading);
    });

    return () => unsubscribe();
  }, [sessionId]); // ✅ Only re-run if sessionId changes

  return {
    logs,
    loading,
    runMavenCommand: (cmd: string) => socketService?.runMavenCommand(cmd),
  };
};
