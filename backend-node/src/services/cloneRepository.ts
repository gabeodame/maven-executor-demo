import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { setJavaProjectPath } from "../config/projectPaths";
import { Server, Socket } from "socket.io";

/**
 * Clones or updates a repository and streams logs via WebSocket
 */
export const cloneRepository = async (
  io: Server,
  socket: Socket,
  repoUrl: string,
  branch: string,
  sessionId: string,
  projectName?: string,
  repoPath?: string,
  pomPath?: string
): Promise<string> => {
  const userWorkspace = `/app/workspaces/${sessionId}`;
  const repoName = projectName || path.basename(repoUrl, ".git");
  const fullRepoPath = path.join(userWorkspace, repoName);
  const gitLockFile = path.join(fullRepoPath, ".git", "index.lock");

  const sendLog = (msg: string) => {
    console.log(`[Backend] ${msg}`);
    if (socket && typeof socket.emit === "function") {
      socket.emit("clone-log", msg);
    } else {
      console.error("❌ ERROR: Invalid socket reference, cannot emit logs.");
    }
  };

  sendLog(`🔍 Checking workspace for session: ${sessionId}`);

  if (!fs.existsSync(userWorkspace)) {
    fs.mkdirSync(userWorkspace, { recursive: true });
    sendLog(`✅ Created workspace: ${userWorkspace}`);
  }

  if (fs.existsSync(fullRepoPath)) {
    sendLog(`⚠️ Repository already exists at: ${fullRepoPath}`);

    if (fs.existsSync(gitLockFile)) {
      sendLog(`⚠️ Stale Git lock file detected. Removing.`);
      fs.unlinkSync(gitLockFile);
    }

    try {
      sendLog(`🔄 Fetching latest changes from branch: ${branch}`);
      sendLog(
        `⚙️ Running: git -C ${fullRepoPath} remote set-url origin ${repoUrl}`
      );
      execSync(`git -C ${fullRepoPath} remote set-url origin ${repoUrl}`, {
        stdio: "inherit",
      });

      sendLog(
        `⚙️ Running: git -C ${fullRepoPath} fetch --depth=1 origin ${branch}`
      );
      execSync(`git -C ${fullRepoPath} fetch --depth=1 origin ${branch}`, {
        stdio: "inherit",
      });

      const remoteBranches = execSync(`git -C ${fullRepoPath} branch -r`, {
        encoding: "utf-8",
      }).trim();
      if (!remoteBranches.includes(`origin/${branch}`)) {
        throw new Error(`❌ ERROR: The branch '${branch}' does not exist.`);
      }

      sendLog(
        `⚙️ Running: git -C ${fullRepoPath} checkout ${branch} || git -C ${fullRepoPath} checkout -b ${branch} origin/${branch}`
      );
      execSync(
        `git -C ${fullRepoPath} checkout ${branch} || git -C ${fullRepoPath} checkout -b ${branch} origin/${branch}`,
        { stdio: "inherit" }
      );

      sendLog(
        `⚙️ Running: git -C ${fullRepoPath} pull origin ${branch} --ff-only`
      );
      execSync(`git -C ${fullRepoPath} pull origin ${branch} --ff-only`, {
        stdio: "inherit",
      });

      sendLog(`✅ Repository updated successfully.`);
    } catch (error) {
      if (error instanceof Error) {
        sendLog(`❌ ERROR: Failed to update repository: ${error.message}`);
      }
      sendLog("🗑 Removing corrupted repo and retrying clone...");
      fs.rmSync(fullRepoPath, { recursive: true, force: true });

      sendLog(`🚀 Cloning fresh repository: ${repoUrl} (branch: ${branch})`);
      execSync(
        `git clone --branch ${branch} --depth=1 ${repoUrl} ${fullRepoPath}`,
        { stdio: "inherit" }
      );
    }
  } else {
    sendLog(`🚀 Cloning repository: ${repoUrl} (branch: ${branch})`);
    sendLog(
      `⚙️ Running: git clone --branch ${branch} --depth=1 ${repoUrl} ${fullRepoPath}`
    );
    execSync(
      `git clone --branch ${branch} --depth=1 ${repoUrl} ${fullRepoPath}`,
      { stdio: "inherit" }
    );
  }

  const projectDir = repoPath
    ? path.resolve(fullRepoPath, repoPath)
    : fullRepoPath;

  if (!fs.existsSync(projectDir)) {
    sendLog(`❌ ERROR: Specified repoPath does not exist: ${projectDir}`);
    throw new Error(
      "Invalid repoPath: The specified directory does not exist."
    );
  }

  const pomFilePath = pomPath
    ? path.join(fullRepoPath, pomPath)
    : path.join(projectDir, "pom.xml");
  if (!fs.existsSync(pomFilePath)) {
    sendLog(`❌ ERROR: No pom.xml found at ${pomFilePath}.`);
    throw new Error("Invalid project: A valid pom.xml file is required.");
  }

  setJavaProjectPath(sessionId, projectDir);
  sendLog(`✅ Repository cloned/updated and set for session: ${sessionId}`);

  return projectDir;
};
