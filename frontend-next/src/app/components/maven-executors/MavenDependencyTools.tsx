"use client";

import { useState } from "react";
import { useSocket } from "../../hooks/useSocket";
import Accordion from "../ui/Accordion";

import { useIsMobile } from "../../hooks/useIsMobile";
import { closeMenu } from "@/app/store/redux-toolkit/slices/menuSlice";
import { useAppDispatch } from "@/app/store/hooks/hooks";

const dependencyCommands = [
  "dependency:tree",
  "dependency:analyze",
  "dependency:resolve",
  "help:effective-pom",
  "help:effective-settings",
];

const MavenDependencyTools = () => {
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
    <Accordion title="Dependency Management">
      <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-4">
        {dependencyCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleRunCommand(cmd)}
            disabled={loading}
            className={`w-full px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200 ${
              loading && selectedCommand === cmd
                ? "bg-gray-500 cursor-not-allowed opacity-70"
                : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {loading && selectedCommand === cmd ? "Running..." : `${cmd}`}
          </button>
        ))}
      </div>
    </Accordion>
  );
};

export default MavenDependencyTools;
