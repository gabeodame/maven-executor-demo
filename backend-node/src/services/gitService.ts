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
    console.log(`🚀 Cloning repository: ${repoUrl} into workspace`);
    execSync(`git clone --branch ${branch} --depth=1 ${repoUrl} ${repoPath}`, {
      stdio: "inherit",
    });

    // ✅ Ensure `pom.xml` exists before proceeding
    const pomPath = path.join(repoPath, "pom.xml");
    if (!fs.existsSync(pomPath)) {
      console.error(`❌ ERROR: No pom.xml found. Deleting repo.`);
      fs.rmSync(repoPath, { recursive: true, force: true }); // ✅ Clean up failed repo
      throw new Error("Invalid project: A valid pom.xml file is required.");
    }

    // ✅ Set Java project path for this session
    setJavaProjectPath(sessionId, repoPath);
    console.log(`✅ Repository cloned and set for session: ${sessionId}`);

    return repoPath;
  } catch (error) {
    console.error("❌ ERROR: Git Clone Failed", error);

    // ✅ Ensure failed repo directory is deleted
    if (fs.existsSync(repoPath)) {
      console.log(`🗑 Cleaning up failed clone: ${repoPath}`);
      fs.rmSync(repoPath, { recursive: true, force: true });
    }

    let errorMessage =
      "An unexpected error occurred during repository cloning.";

    if (error instanceof Error) {
      if (error.message.includes("No pom.xml")) {
        errorMessage = "Invalid project: A valid pom.xml file is required.";
      } else if (error.message.includes("Git clone operation failed")) {
        errorMessage =
          "Git clone operation failed. Please check the repository URL and branch.";
      } else {
        errorMessage = error.message; // Preserve other possible errors
      }
    }

    throw new Error(errorMessage);
  }
};

//TODO: Ensure user can setup webhook to detect git updates.
//TODO: make sure user can update existing repo. may be why reclone? that case replace existing
