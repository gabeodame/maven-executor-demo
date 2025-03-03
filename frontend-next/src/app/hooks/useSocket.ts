import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

const isDev = process.env.NODE_ENV === "development";
const SOCKET_URL = isDev
  ? "http://localhost:5001"
  : process.env.NEXT_PUBLIC_VITE_API_URL!;

export const useSocket = () => {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const sessionId =
      session?.user?.id || `guest-${Math.random().toString(36).substr(2, 9)}`;

    if (socketRef.current) return; // Prevent duplicate connections

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: { sessionId }, // ✅ Send session ID (user or guest)
    });

    socketRef.current = socket;
    console.log(
      "🔗 WebSocket Connected to:",
      SOCKET_URL,
      "Session ID:",
      sessionId
    );

    socket.on("maven-output", (data: string) => {
      console.log("📥 Received Maven Output:", data);
      setLogs((prevLogs) => [...prevLogs, data]);
      if (data.includes("BUILD SUCCESS") || data.includes("BUILD FAILURE")) {
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
  }, [session]);

  const runMavenCommand = useCallback((command: string) => {
    if (!socketRef.current) {
      console.log("⚠️ WebSocket is not initialized!");
      return;
    }

    console.log(`▶️ [CLIENT] Sending command: mvn ${command}`);

    setLogs([]);
    setLoading(true);

    socketRef.current.emit("run-maven", command);
  }, []);

  return { logs, loading, runMavenCommand, socket: socketRef.current };
};
