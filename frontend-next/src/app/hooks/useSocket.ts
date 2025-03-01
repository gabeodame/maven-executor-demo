import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const isDev = process.env.NODE_ENV === "development";
const SOCKET_URL = isDev
  ? "http://localhost:5001"
  : process.env.NEXT_PUBLIC_VITE_API_URL!;

export const useSocket = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    console.log("🔗 WebSocket Connected to:", SOCKET_URL);

    socketRef.current.on("maven-output", (data: string) => {
      setLogs((prevLogs) => [...prevLogs, data]);

      if (
        data.includes("BUILD SUCCESS") ||
        data.includes("BUILD FAILURE") ||
        data.includes("Process exited with code") ||
        data.includes("[INFO] Total time:")
      ) {
        setTimeout(() => setLoading(false), 500);
      }
    });

    return () => {
      console.log("❌ Disconnecting WebSocket");
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const runMavenCommand = useCallback((command: string) => {
    if (!socketRef.current) {
      console.log("⚠️ WebSocket is not initialized!");
      return;
    }

    console.log(`▶️ [CLIENT] Sending command to backend: mvn ${command}`);
    setLogs([`▶️ Executing mvn ${command}...`]);
    setLoading(true);
    socketRef.current.emit("run-maven", command);
  }, []);

  return { logs, setLogs, loading, runMavenCommand, socket: socketRef.current };
};
