"use client";
import React from "react";
import { useSocket } from "../hooks/useSocket";
import MavenButton from "./MavenButton";
import ConsoleOutput from "./ConsoleOutput";
import RepoList from "./RepoList"; // ✅ Integrate RepoList inside Executor
import Artifacts from "./Artifacts";

const Executor = () => {
  const { logs, loading, runMavenCommand } = useSocket();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-screen p-6 bg-gray-900 text-white">
      {/* Title */}
      <h2 className="text-3xl font-bold text-center">
        📦 Maven Command Executor
      </h2>

      {/* Repo Selection */}
      <div className="w-full max-w-lg mb-6">
        <RepoList />
      </div>

      {/* Buttons for Maven commands */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 w-full max-w-lg">
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
      <div className="w-full max-w-3xl bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-[65vh] min-h-[350px]">
        <h3 className="text-lg font-semibold text-center mb-2">
          Console Output
        </h3>
        <div className="flex-1 overflow-hidden">
          <ConsoleOutput logs={logs} />

          {/* Build Artificats */}
        </div>
        <Artifacts />
      </div>
    </div>
  );
};

export default Executor;
