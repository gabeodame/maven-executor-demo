import React from "react";
import MavenDebugTools from "./MavenDebugTools";
import MavenDependencyTools from "./MavenDependencyTools";
import MavenExecutionTools from "./MavenExecutionTools";
import MavenPipeline from "./MavenPipeline";
import UserAccount from "./UserAccount";

async function SideBarLeft() {
  return (
    <div
      className="flex flex-col gap-4 p-4 shadow-md w-full 
                 overflow-y-auto overflow-x-hidden items-center h-full"
    >
      <UserAccount />
      <MavenDependencyTools />
      <MavenDebugTools />
      <MavenExecutionTools />
      <MavenPipeline />
    </div>
  );
}

export default SideBarLeft;
