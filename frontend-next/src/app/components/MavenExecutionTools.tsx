"use client";

import { useState } from "react";
import { useSocket } from "../hooks/useSocket";
import Accordion from "./ui/Accordion";

const executionCommands = [
  "install",
  "deploy",
  "site",
  "verify",
  "clean install -U",
];

const MavenExecutionTools = () => {
  const { loading, runMavenCommand } = useSocket();
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);

  const handleRunCommand = (cmd: string) => {
    setSelectedCommand(cmd);
    runMavenCommand(cmd);
  };

  return (
    <Accordion title="Execution & Lifecycle">
      <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-4">
        {executionCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleRunCommand(cmd)}
            disabled={loading}
            className={`px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200 ${
              loading && selectedCommand === cmd
                ? "bg-gray-500 cursor-not-allowed opacity-70"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading && selectedCommand === cmd ? "Running..." : `Maven ${cmd}`}
          </button>
        ))}
      </div>
    </Accordion>
  );
};

export default MavenExecutionTools;
