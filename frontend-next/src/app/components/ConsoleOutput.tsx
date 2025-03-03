"use client";
import { useSocket } from "../hooks/useSocket";

const getLogColor = (log: string) => {
  if (
    log.includes("ERROR") ||
    log.match(/Failures:\s*[1-9]/) ||
    log.match(/Errors:\s*[1-9]/)
  ) {
    return "text-red-500"; // ❌ Failure/Error detected
  }
  if (
    log.includes("SUCCESS") ||
    log.includes("BUILD SUCCESS") ||
    log.match(/Failures:\s*0, Errors:\s*0/)
  ) {
    return "text-green-400"; // ✅ Success or All Tests Passed
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
  const { logs } = useSocket();
  return (
    <div className="bg-gray-800 text-white p-3 w-full max-w-4xl h-full min-h-[300px] overflow-y-auto font-mono rounded-md border  border-gray-700 flex flex-col">
      {logs.map((log, index) => (
        <div
          key={index}
          className={`${getLogColor(
            log
          )} mb-1 text-sm whitespace-pre-wrap leading-relaxed`}
        >
          {log}
        </div>
      ))}
    </div>
  );
};

export default ConsoleOutput;
