import React from "react";
import MavenDebugTools from "./MavenDebugTools";
import MavenDependencyTools from "./MavenDependencyTools";
import MavenExecutionTools from "./MavenExecutionTools";
import MavenPipeline from "./MavenPipeline";
import UserAccount from "./UserAccount";

async function SideBarLeft() {
  return (
    <div
      className="hidden md:flex flex-col gap-4  p-4 shadow-md 
                  md:w-[20%] min-w-[250px] max-w-[300px] 
                  overflow-y-auto overflow-x-hidden items-center min-h-full"
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
