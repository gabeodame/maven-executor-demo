"use client";
import { useSocket } from "../hooks/useSocket";
import MavenButton from "./MavenButton";

const Executor = () => {
  const { loading, runMavenCommand } = useSocket();

  const handleRunCommand = (cmd: string) => {
    console.log("🎯 handleRunCommand triggered for:", cmd);
    runMavenCommand(cmd);
    console.log("✅ runMavenCommand called for:", cmd);
  };

  return (
    <div className="w-full flex flex-wrap justify-center gap-2 sm:gap-3 p-4">
      {["validate", "compile", "test", "package", "clean"].map((cmd) => (
        <div
          key={cmd}
          className="w-full sm:w-auto flex-1 min-w-[100px] max-w-[180px]"
        >
          <MavenButton
            command={cmd}
            onClick={() => handleRunCommand(cmd)}
            disabled={loading}
          />
        </div>
      ))}
    </div>
  );
};

export default Executor;
