"use client";

import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks/hooks";
import {
  addMavenLog,
  clearMavenLogs,
  // clearCloneLogs,
} from "../store/redux-toolkit/slices/logSlice";
import {
  guestUserWelcome,
  gitHubUserWelcome,
  initialLogs,
} from "../util/constants/initialLogs";
import { useSessionCache } from "../store/hooks/useSessionCache";

// ✅ Helper Function to Apply Colors Based on Log Content
const getLogColor = (log: string) => {
  if (
    log.includes("ERROR") ||
    log.includes("❌") ||
    log.match(/Failures:\s*[1-9]/) ||
    log.match(/Errors:\s*[1-9]/)
  ) {
    return "text-red-500"; // 🔴 Error
  }
  if (
    log.includes("SUCCESS") ||
    log.includes("BUILD SUCCESS") ||
    log.includes("✅") ||
    log.match(/Failures:\s*0, Errors:\s*0/)
  ) {
    return "text-green-400"; // ✅ Success
  }
  if (log.includes("WARNING") || log.includes("⚠️")) {
    return "text-yellow-400"; // ⚠️ Warning
  }
  if (log.includes("[INFO]") || log.includes("🔍")) {
    return "text-blue-300"; // 📘 Info
  }
  return "text-gray-300"; // Default
};

const ConsoleOutput = () => {
  const { sessionId } = useSessionCache();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { isGitHubUser } = useSessionCache();
  const { cloneLogs, mavenLogs } = useAppSelector((state) => state.logs);
  const dispatch = useAppDispatch();

  // ✅ Initialize Welcome Message (Cleared When Cloning Starts)
  useEffect(() => {
    if (!sessionId) {
      initialLogs.forEach((log) => dispatch(addMavenLog(log)));
      return;
    }

    const welcomeMessage = isGitHubUser ? gitHubUserWelcome : guestUserWelcome;
    welcomeMessage.forEach((log) => dispatch(addMavenLog(log)));
  }, [isGitHubUser, dispatch, sessionId]);

  // ✅ Detect Cloning & Clear Initial Logs
  useEffect(() => {
    if (cloneLogs.length > 0) {
      console.log("🧹 Clearing initial logs for cleaner output...");
      dispatch(clearMavenLogs()); // ✅ Remove welcome messages
    }
  }, [cloneLogs, dispatch]);

  // ✅ Auto-scroll when logs update
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mavenLogs, cloneLogs]);

  return (
    <div
      className="flex h-full flex-col flex-1 overflow-auto bg-gray-800 text-white p-3 font-mono rounded-md border border-gray-700"
      style={{ minHeight: "30vh", maxHeight: "calc(100vh - 290px)" }}
    >
      {[...mavenLogs, ...cloneLogs].map((log, index) => (
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
