"use client";

import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { useSessionCache } from "../store/react-context/SessionProvider";
import { addMavenLog } from "../store/redux-toolkit/slices/logSlice";
import {
  guestUserWelcome,
  gitHubUserWelcome,
  initialLogs,
} from "../util/constants/initialLogs";

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
  const { sessionId } = useSessionCache();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { isGitHubUser } = useSessionCache();
  const { cloneLogs, mavenLogs } = useAppSelector((state) => state.logs);
  const dispatch = useAppDispatch();

  // ✅ Check session & reset logs if needed

  useEffect(() => {
    let welcomeMessage;
    if (!sessionId) {
      welcomeMessage = initialLogs;
      dispatch(addMavenLog(""));
      return;
    }
    if (sessionId) {
      welcomeMessage = isGitHubUser ? gitHubUserWelcome : guestUserWelcome;
    }
    welcomeMessage?.forEach((log) => dispatch(addMavenLog(log)));
  }, [isGitHubUser, dispatch, sessionId]);

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
