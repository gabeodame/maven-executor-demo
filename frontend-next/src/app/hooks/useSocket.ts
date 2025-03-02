import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const isDev = process.env.NODE_ENV === "development";
const SOCKET_URL = isDev
  ? "http://localhost:5001"
  : process.env.NEXT_PUBLIC_VITE_API_URL!;

export const useSocket = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [logsState, setLogsState] = useState<string[]>([]); // ✅ New state for React updates
  const [loading, setLoading] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) return; // Prevent duplicate connections

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;
    console.log("🔗 WebSocket Connected to:", SOCKET_URL);

    socket.on("maven-output", (data: string) => {
      console.log("📥 Received maven-output log:", data);

      setLogs((prevLogs) => {
        const newLogs = [...prevLogs, data];
        // console.log("📜 Updated Logs State:", newLogs);
        return newLogs;
      });

      if (
        data.includes("BUILD SUCCESS") ||
        data.includes("BUILD FAILURE") ||
        data.includes("Process exited with code") ||
        data.includes("[INFO] Total time:")
      ) {
        console.log("✅ Command execution complete.");
        setLoading(false);
      }
    });

    socket.on("connect", () => console.log("✅ WebSocket connected"));
    socket.on("disconnect", () => console.log("❌ WebSocket disconnected"));

    return () => {
      console.log("❌ Disconnecting WebSocket");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ✅ Sync logs to logsState so React updates properly
  useEffect(() => {
    console.log("🔄 Syncing logsState with logs...");
    setLogsState(logs);
  }, [logs]);

  const runMavenCommand = useCallback((command: string) => {
    if (!socketRef.current) {
      console.log("⚠️ WebSocket is not initialized!");
      return;
    }

    console.log(`▶️ [CLIENT] Sending command to backend: mvn ${command}`);

    setLogs([]); // ✅ Clear logs before running a new command
    setLogsState([]); // ✅ Clear logsState to force re-render
    setLoading(true);

    socketRef.current.emit("run-maven", command);
  }, []);

  return {
    logs: logsState,
    loading,
    runMavenCommand,
    socket: socketRef.current,
  };
};
