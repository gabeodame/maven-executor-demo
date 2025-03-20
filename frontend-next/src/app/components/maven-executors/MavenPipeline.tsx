"use client";

import { useState } from "react";
import { useSocket } from "../../hooks/useSocket";
import Accordion from "../ui/Accordion";

import { useIsMobile } from "../../hooks/useIsMobile"; // ✅ Import the new hook
import { closeMenu } from "@/app/store/redux-toolkit/slices/menuSlice";
import { useAppDispatch } from "@/app/store/hooks/hooks";

const pipelines = [
  { name: "Full Build", commands: ["clean", "compile", "package", "install"] },
  { name: "Test & Verify", commands: ["clean", "test", "verify"] },
  { name: "Deploy to Repo", commands: ["clean", "package", "deploy"] },
  {
    name: "Dependency Analysis",
    commands: ["clean", "dependency:tree", "dependency:analyze"],
  },
];

const MavenPipeline = () => {
  const { loading, runMavenCommand } = useSocket();
  const [runningPipeline, setRunningPipeline] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile(); // ✅ Use the hook

  const handleRunPipeline = async (pipeline: {
    name: string;
    commands: string[];
  }) => {
    if (isMobile) dispatch(closeMenu());

    setRunningPipeline(pipeline.name);
    for (const cmd of pipeline.commands) {
      runMavenCommand(cmd, "pipeline");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // ✅ Avoid overloading
    }
    setRunningPipeline(null);
  };

  return (
    <Accordion title="Pipeline Automation">
      <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-4">
        {pipelines.map((pipeline) => (
          <button
            key={pipeline.name}
            onClick={() => handleRunPipeline(pipeline)}
            disabled={loading || runningPipeline !== null}
            className={`w-full px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200 ${
              runningPipeline === pipeline.name
                ? "bg-gray-500 cursor-not-allowed opacity-70"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {runningPipeline === pipeline.name ? "Running..." : pipeline.name}
          </button>
        ))}
      </div>
    </Accordion>
  );
};

export default MavenPipeline;
