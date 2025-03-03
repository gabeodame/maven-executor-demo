"use client";
import { useSocket } from "../hooks/useSocket";
import MavenButton from "./MavenButton";

const Executor = () => {
  const { loading, runMavenCommand } = useSocket();

  return (
    <div className=" w-full flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3">
      {["validate", "compile", "test", "package", "clean"].map((cmd) => (
        <MavenButton
          key={cmd}
          command={cmd}
          onClick={() => runMavenCommand(cmd)}
          disabled={loading}
        />
      ))}
    </div>
  );
};

export default Executor;
