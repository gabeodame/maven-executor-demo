"use client";
import React from "react";
import { useSocket } from "../hooks/useSocket";
import MavenButton from "./MavenButton";
import ConsoleOutput from "./ConsoleOutput";
import RepoList from "./RepoList";
import Artifacts from "./Artifacts";
import BuildMetrics from "./BuildMetrics";

const Executor = () => {
  const { logs, loading, runMavenCommand } = useSocket();

  console.log("🔧 Executor rendering...");
  console.log("🔧 logs:", logs);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full p-6 bg-gray-900 text-white">
      {/* Title */}
      <h2 className="text-3xl font-bold text-center mb-6">
        📦 Maven Command Executor
      </h2>

      {/* Repo Selection */}
      <div className="w-full max-w-lg mb-4">
        <RepoList />
      </div>

      {/* Buttons for Maven commands */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-lg mb-6">
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
      <div className="w-full max-w-4xl bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-[55vh] min-h-[300px]">
        <h3 className="text-lg font-semibold text-center mb-2">
          Console Output
        </h3>
        <div className="flex-1 overflow-y-auto bg-gray-900 p-3 rounded-md">
          <ConsoleOutput logs={logs} />
        </div>
      </div>

      {/* Build Metrics & Artifacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mt-6">
        <BuildMetrics logs={logs} />
        <Artifacts />
      </div>
    </div>
  );
};

export default Executor;
