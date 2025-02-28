import React from "react";

interface ConsoleOutputProps {
  logs: string[];
}

const getLogColor = (log: string) => {
  if (log.includes("ERROR")) return "text-red-500";
  if (log.includes("SUCCESS") || log.includes("BUILD SUCCESS"))
    return "text-green-400";
  if (log.includes("WARNING")) return "text-yellow-400";
  if (log.includes("[INFO]")) return "text-blue-300";
  return "text-gray-300";
};

const ConsoleOutput = ({ logs }: ConsoleOutputProps) => {
  return (
    <div className="bg-gray-800 text-white p-3 w-[90vw] max-w-[800px] h-[60vh] min-h-[250px] overflow-y-auto font-mono rounded-md border border-gray-700 flex flex-col">
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
