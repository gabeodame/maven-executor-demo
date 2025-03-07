"use client";

import { useEffect, useState, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useSessionCache } from "../store/SessionProvider";

const getLogColor = (log: string) => {
  if (
    log.includes("ERROR") ||
    log.match(/Failures:\s*[1-9]/) ||
    log.match(/Errors:\s*[1-9]/)
  ) {
    return "text-red-500";
  }
  if (
    log.includes("SUCCESS") ||
    log.includes("BUILD SUCCESS") ||
    log.match(/Failures:\s*0, Errors:\s*0/)
  ) {
    return "text-green-400";
  }
  if (log.includes("WARNING")) {
    return "text-yellow-400";
  }
  if (log.includes("[INFO]")) {
    return "text-blue-300";
  }
  return "text-gray-300";
};

const ConsoleOutput = () => {
  const [receivedLogs, setReceivedLogs] = useState<string[]>([]);
  const { sessionId } = useSessionCache();
  const { cloneLogs, mavenLogs } = useSocket();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      setReceivedLogs([
        "🚀 Welcome to Maven Command Executor!",
        "🔑 Please log in to execute commands:\n   - Sign in with GitHub: Type 'login github'\n   - Continue as Guest: Type 'login guest'",
        "⚡ Once logged in, select Maven commands to execute.",
      ]);
      return;
    }

    // ✅ Replace logs instead of appending to `receivedLogs`
    setReceivedLogs([...cloneLogs, ...mavenLogs]);
  }, [mavenLogs, sessionId, cloneLogs]);

  // ✅ Auto-scroll to the latest log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [receivedLogs]);

  return (
    <div
      className="flex h-full flex-col flex-1 overflow-auto bg-gray-800 text-white p-3 font-mono rounded-md border border-gray-700"
      style={{ minHeight: "30vh", maxHeight: "calc(100vh - 290px)" }}
    >
      {receivedLogs.map((log, index) => (
        <div
          key={index}
          className={`${getLogColor(
            log
          )} mb-1 text-sm whitespace-pre-wrap leading-normal`}
        >
          {log}
        </div>
      ))}
      <div ref={logsEndRef} /> {/* Invisible div to auto-scroll */}
    </div>
  );
};

export default ConsoleOutput;
