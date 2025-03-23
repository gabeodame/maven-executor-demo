import React from "react";

import UserAccount from "./UserAccount";
import MavenCommandPanel from "./maven-executors/MavenCommandPanel";

async function SideBarLeft() {
  return (
    <div className="flex flex-col gap-4 p-4 shadow-md w-full overflow-y-auto overflow-x-hidden items-center h-full">
      <UserAccount />
      <MavenCommandPanel
        title="Debugging & Optimization"
        commands={[
          "help:describe -Dcmd=compile",
          "versions:display-dependency-updates",
          "versions:display-plugin-updates",
          "test -X",
        ]}
        variant="blue"
      />

      <MavenCommandPanel
        title="Dependency Management"
        commands={[
          "dependency:tree",
          "dependency:analyze",
          "dependency:resolve",
          "help:effective-pom",
          "help:effective-settings",
        ]}
        variant="cyan"
      />

      <MavenCommandPanel
        title="Common Commands"
        commands={["clean", "compile", "test", "package", "install", "deploy"]}
        variant="green"
      />

      <MavenCommandPanel
        title="Pipeline Automation"
        isPipeline
        variant="purple"
        commands={[
          {
            name: "Full Build",
            commands: ["clean", "compile", "package", "install"],
          },
          { name: "Test & Verify", commands: ["clean", "test", "verify"] },
          { name: "Deploy to Repo", commands: ["clean", "package", "deploy"] },
          {
            name: "Dependency Analysis",
            commands: ["clean", "dependency:tree", "dependency:analyze"],
          },
        ]}
      />
    </div>
  );
}

export default SideBarLeft;
