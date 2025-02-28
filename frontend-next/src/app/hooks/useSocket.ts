import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const isDev = process.env.NODE_ENV === "development";

export const useSocket = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(
        isDev ? "http://localhost:5001" : process.env.NEXT_PUBLIC_VITE_API_URL!,
        {
          transports: ["websocket", "polling"],
          withCredentials: true,
        }
      );

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
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const runMavenCommand = useCallback((command: string) => {
    if (!socketRef.current) return;

    setLogs([`▶️ Executing mvn ${command}...`]);
    setLoading(true);
    socketRef.current.emit("run-maven-command", command);
  }, []);

  return { logs, loading, runMavenCommand };
};
