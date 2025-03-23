"use client";

import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks/hooks";
import {
  addMavenLog,
  clearMavenLogs,
} from "../store/redux-toolkit/slices/logSlice";
import {
  guestUserWelcome,
  gitHubUserWelcome,
  initialLogs,
} from "../util/constants/initialLogs";
import { useSessionCache } from "../store/hooks/useSessionCache";

const getLogColor = (log: string) => {
  if (
    log.includes("ERROR") ||
    log.includes("❌") ||
    log.match(/Failures:\s*[1-9]/) ||
    log.match(/Errors:\s*[1-9]/)
  )
    return "text-red-500";
  if (
    log.includes("SUCCESS") ||
    log.includes("BUILD SUCCESS") ||
    log.includes("✅") ||
    log.match(/Failures:\s*0, Errors:\s*0/)
  )
    return "text-green-400";
  if (log.includes("WARNING") || log.includes("⚠️")) return "text-yellow-400";
  if (log.includes("[INFO]") || log.includes("🔍")) return "text-blue-300";
  return "text-gray-300";
};

const ConsoleOutput = () => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { sessionId, isGitHubUser } = useSessionCache();
  const { cloneLogs, mavenLogs } = useAppSelector((state) => state.logs);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!sessionId) {
      initialLogs.forEach((log) => dispatch(addMavenLog(log)));
      return;
    }
    const welcome = isGitHubUser ? gitHubUserWelcome : guestUserWelcome;
    welcome.forEach((log) => dispatch(addMavenLog(log)));
  }, [dispatch, sessionId, isGitHubUser]);

  useEffect(() => {
    if (cloneLogs.length > 0) {
      dispatch(clearMavenLogs());
    }
  }, [cloneLogs, dispatch]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mavenLogs, cloneLogs]);

  return (
    <div className="scroll-isolated bg-gray-800 text-white p-3 font-mono rounded-md border border-gray-700 h-full">
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
      <div ref={logsEndRef} />
    </div>
  );
};

export default ConsoleOutput;
