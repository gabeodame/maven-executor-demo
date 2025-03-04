import { useEffect, useState } from "react";
import SocketService from "../services/SocketService";
import { useSessionCache } from "../hooks/useSessionCache";
import { useSession } from "next-auth/react";

export const useSocket = () => {
  const cachedSessionId = useSessionCache(); // ✅ Use cached session ID
  const { data: session } = useSession();
  const sessionId = session?.user?.id || cachedSessionId;

  // ✅ Prevent initializing WebSocket without a session ID
  const [socketService, setSocketService] = useState<SocketService | null>(
    null
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  console.log("🔒 useSocket: Session ID:", sessionId);
  useEffect(() => {
    if (!sessionId) {
      console.warn("⚠️ useSocket: No session ID available!");
      return;
    }

    console.log(
      "🛠️ useSocket: Initializing WebSocket with session:",
      sessionId
    );

    const newSocketService = SocketService.getInstance(sessionId);
    console.log(
      "✅ useSocket: WebSocket service initialized:",
      newSocketService
    );

    setSocketService(newSocketService);

    const unsubscribe = newSocketService.subscribe((newLogs, isLoading) => {
      setLogs(newLogs);
      setLoading(isLoading);
    });

    return () => unsubscribe();
  }, [sessionId]);

  return {
    logs,
    loading,
    runMavenCommand: (cmd: string) => {
      console.log(
        "🛠️ useSocket: Checking socketService before sending command:",
        socketService
      );
      socketService?.runMavenCommand(cmd);
    },
  };
};
