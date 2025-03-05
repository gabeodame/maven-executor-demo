import React from "react";
import MavenDebugTools from "./MavenDebugTools";
import MavenDependencyTools from "./MavenDependencyTools";
import MavenExecutionTools from "./MavenExecutionTools";
import MavenPipeline from "./MavenPipeline";
import UserAccount from "./UserAccount";

async function SideBarLeft() {
  return (
    <aside className="hidden md:flex flex-col gap-2 bg-gray-700 p-4 shadow-md md:w-[20%] min-w-[250px] overflow-y-auto">
      <UserAccount />

      <MavenDependencyTools />
      <MavenDebugTools />
      <MavenExecutionTools />
      <MavenPipeline />
    </aside>
  );
}

export default SideBarLeft;
