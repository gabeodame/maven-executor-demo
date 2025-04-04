"use client";

import { useState } from "react";
import { useSocket } from "../../hooks/useSocket";
import Accordion from "../ui/Accordion";
// import { useMenu } from "../../store/react-context/MenuContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { closeMenu } from "@/app/store/redux-toolkit/slices/menuSlice";
import { useAppDispatch } from "@/app/store/hooks/hooks";

const debugCommands = [
  "help:describe -Dcmd=compile",
  "versions:display-dependency-updates",
  "versions:display-plugin-updates",
  "test -X",
];

const MavenDebugTools = () => {
  const { loading, runMavenCommand } = useSocket();
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  const handleRunCommand = (cmd: string) => {
    if (isMobile) dispatch(closeMenu());
    setSelectedCommand(cmd);
    runMavenCommand(cmd);
  };

  return (
    <Accordion title="Debugging & Optimization">
      <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-4">
        {debugCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleRunCommand(cmd)}
            disabled={loading}
            className={`w-full px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200 ${
              loading && selectedCommand === cmd
                ? "bg-gray-500 cursor-not-allowed opacity-70"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading && selectedCommand === cmd ? "Running..." : `${cmd}`}
          </button>
        ))}
      </div>
    </Accordion>
  );
};

export default MavenDebugTools;
