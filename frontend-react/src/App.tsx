import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_API_URL || "http://localhost:5001", // Default to localhost for dev
  {
    transports: ["websocket", "polling"],
    withCredentials: true,
  }
);

const App: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const runMavenCommand = (command: string) => {
    setLogs([]);
    setLoading(true);
    socket.emit("run-maven-command", command);
  };

  useEffect(() => {
    socket.on("maven-output", (data: string) => {
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
      socket.off("maven-output");
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Full viewport height
        width: "100vw", // Full viewport width
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#1e1e1e", // Dark background for better contrast
        color: "#ffffff",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "15px" }}>
        📦 Maven Command Executor
      </h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        {["validate", "compile", "test", "package", "clean"].map((cmd) => (
          <button
            key={cmd}
            onClick={() => runMavenCommand(cmd)}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: loading
                ? "#777"
                : cmd === "clean"
                ? "#007bff"
                : cmd === "compile"
                ? "#28a745"
                : cmd === "package"
                ? "#ffc107"
                : cmd === "validate"
                ? "#17a2b8"
                : "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Maven {cmd.charAt(0).toUpperCase() + cmd.slice(1)}
          </button>
        ))}
      </div>

      <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>
        Console Output:
      </h3>
      <div
        style={{
          background: "#282828",
          color: "#ffffff",
          padding: "10px",
          width: "90vw", // Almost full width
          height: "60vh", // Takes most of the vertical space
          overflowY: "auto",
          fontFamily: "monospace",
          borderRadius: "5px",
          border: "1px solid #444",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {logs.map((log, index) => {
          let color = "#cccccc";

          if (log.includes("ERROR")) {
            color = "#ff5555";
          } else if (log.includes("SUCCESS") || log.includes("BUILD SUCCESS")) {
            color = "#50fa7b";
          } else if (log.includes("WARNING")) {
            color = "#ffb86c";
          } else if (log.includes("[INFO]")) {
            color = "#8be9fd";
          }

          return (
            <div
              key={index}
              style={{ color, marginBottom: "2px", whiteSpace: "pre-wrap" }}
            >
              {log}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
