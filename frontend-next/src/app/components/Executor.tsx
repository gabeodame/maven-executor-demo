"use client";
import React from "react";
import { useSocket } from "../hooks/useSocket";
import MavenButton from "./MavenButton";
import ConsoleOutput from "./ConsoleOutput";

const Executor = () => {
  const { logs, loading, runMavenCommand } = useSocket();

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen p-5 bg-gray-900 text-white">
      <h2 className="text-xl text-center mb-4">📦 Maven Command Executor</h2>

      {/* Buttons for Maven commands */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
        {["validate", "compile", "test", "package", "clean"].map((cmd) => (
          <MavenButton
            key={cmd}
            command={cmd}
            onClick={() => runMavenCommand(cmd)}
            disabled={loading}
          />
        ))}
      </div>

      {/* Console Output */}
      <h3 className="text-lg text-center mb-2">Console Output:</h3>
      <ConsoleOutput logs={logs} />
    </div>
  );
};

export default Executor;
