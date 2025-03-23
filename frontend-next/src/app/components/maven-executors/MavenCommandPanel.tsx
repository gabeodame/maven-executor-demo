"use client";

import { useState } from "react";
import { useSocket } from "@/app/hooks/useSocket";
import Accordion from "../ui/Accordion";
import { closeMenu } from "@/app/store/redux-toolkit/slices/menuSlice";
import { useAppDispatch } from "@/app/store/hooks/hooks";
import { useIsMobile } from "@/app/hooks/useIsMobile";

type CommandGroup = {
  title: string;
  commands: string[] | { name: string; commands: string[] }[];
  variant?: "blue" | "cyan" | "green" | "purple";
  isPipeline?: boolean;
};

const VARIANT_CLASSES = {
  blue: "bg-blue-600 hover:bg-blue-700",
  cyan: "bg-cyan-600 hover:bg-cyan-700",
  green: "bg-green-600 hover:bg-green-700",
  purple: "bg-purple-600 hover:bg-purple-700",
};

const MavenCommandPanel = ({
  title,
  commands,
  variant = "blue",
  isPipeline = false,
}: CommandGroup) => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { runMavenCommand, loading } = useSocket();

  const [active, setActive] = useState<string | null>(null);

  const runSingleCommand = (cmd: string) => {
    if (isMobile) dispatch(closeMenu());
    setActive(cmd);
    runMavenCommand(cmd);
  };

  const runPipeline = async (pipeline: {
    name: string;
    commands: string[];
  }) => {
    if (isMobile) dispatch(closeMenu());
    setActive(pipeline.name);
    for (const cmd of pipeline.commands) {
      runMavenCommand(cmd, "pipeline");
      await new Promise((res) => setTimeout(res, 2000));
    }
    setActive(null);
  };

  const variantClass = VARIANT_CLASSES[variant];

  return (
    <Accordion title={title}>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-4">
          {!isPipeline &&
            (commands as string[]).map((cmd) => (
              <button
                key={cmd}
                disabled={loading && active === cmd}
                onClick={() => runSingleCommand(cmd)}
                className={`w-full px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200 ${
                  loading && active === cmd
                    ? "bg-gray-500 cursor-not-allowed opacity-70"
                    : variantClass
                }`}
              >
                {loading && active === cmd ? "Running..." : cmd}
              </button>
            ))}

          {isPipeline &&
            (commands as { name: string; commands: string[] }[]).map((pipe) => (
              <button
                key={pipe.name}
                disabled={loading || !!active}
                onClick={() => runPipeline(pipe)}
                className={`w-full px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200 ${
                  active === pipe.name
                    ? "bg-gray-500 cursor-not-allowed opacity-70"
                    : variantClass
                }`}
              >
                {active === pipe.name ? "Running..." : pipe.name}
              </button>
            ))}
        </div>
      </div>
    </Accordion>
  );
};

export default MavenCommandPanel;
