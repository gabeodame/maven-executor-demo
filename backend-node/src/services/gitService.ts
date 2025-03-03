import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { setJavaProjectPath } from "../config/projectPaths";

export const cloneRepository = (
  repoUrl: string,
  branch: string,
  sessionId: string,
  projectName?: string
): string => {
  const userWorkspace = `/app/workspaces/${sessionId}`;
  const repoName = projectName || path.basename(repoUrl, ".git");
  const repoPath = path.join(userWorkspace, repoName);

  console.log(`🔍 Checking workspace for session: ${sessionId}`);

  // ✅ Ensure workspace exists
  if (!fs.existsSync(userWorkspace)) {
    fs.mkdirSync(userWorkspace, { recursive: true });
    console.log(`✅ Created workspace: ${userWorkspace}`);
  }

  // ✅ Remove existing repo if it exists
  if (fs.existsSync(repoPath)) {
    console.log(`⚠️ Repository already exists! Deleting: ${repoPath}`);
    fs.rmSync(repoPath, { recursive: true, force: true });
  }

  try {
    console.log(`🚀 Cloning repository: ${repoUrl} into ${repoPath}`);
    execSync(`git clone --branch ${branch} --depth=1 ${repoUrl} ${repoPath}`, {
      stdio: "inherit",
    });

    // ✅ Ensure `pom.xml` exists before proceeding
    if (!fs.existsSync(path.join(repoPath, "pom.xml"))) {
      console.error(`❌ ERROR: No pom.xml found in ${repoPath}`);
      throw new Error(`No pom.xml found in ${repoPath}`);
    }

    // ✅ Set Java project path for this session
    setJavaProjectPath(sessionId, repoPath);
    console.log(`✅ Repository cloned and set for session: ${sessionId}`);

    return repoPath;
  } catch (error) {
    console.error("❌ ERROR: Git Clone Failed", error);
    throw new Error("Git clone operation failed.");
  }
};
