import React from "react";

import UserAccount from "./UserAccount";
import MavenDebugTools from "./maven-executors/MavenDebugTools";
import MavenDependencyTools from "./maven-executors/MavenDependencyTools";
import MavenExecutionTools from "./maven-executors/MavenExecutionTools";
import MavenPipeline from "./maven-executors/MavenPipeline";

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
