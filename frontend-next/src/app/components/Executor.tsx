"use client";
// import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useSessionCache } from "../store/SessionProvider";
import MavenButton from "./MavenButton";
import { toast, Toaster } from "sonner";
import { BsExclamationOctagonFill } from "react-icons/bs";

const Executor = () => {
  const { loading, runMavenCommand } = useSocket();
  // const [isUser, setIsUser] = useState(false)

  const { sessionId } = useSessionCache();

  // useEffect(() => {

  // }, [])

  const handleRunCommand = (cmd: string) => {
    if (!sessionId)
      toast.error("Sign in required", {
        className: "my-classname",
        position: "top-center",
        description:
          "Sign in with GitHub to use your own repositories or continue as Guest to access the default demo-java-app.",
        duration: 3000,
        icon: <BsExclamationOctagonFill />,
      });

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
      <Toaster />
    </div>
  );
};

export default Executor;
