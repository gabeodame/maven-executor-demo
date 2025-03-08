import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { setJavaProjectPath } from "../config/projectPaths";
import { Server, Socket } from "socket.io";

/**
 * Clones or updates a repository and streams logs via WebSocket.
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

  /**
   * Sends a log message to both console and WebSocket.
   */
  const sendLog = (msg: string) => {
    console.log(`[Backend] ${msg}`);
    if (socket && typeof socket.emit === "function") {
      socket.emit("clone-log", msg);
    }
  };

  sendLog(`🔍 Checking workspace for session: ${sessionId}`);

  try {
    // ✅ Ensure workspace directory exists
    if (!fs.existsSync(userWorkspace)) {
      fs.mkdirSync(userWorkspace, { recursive: true });
      sendLog(`✅ Created workspace: ${userWorkspace}`);
    }

    // ✅ Apply correct permissions (DO NOT log for security reasons)
    execSync(`chown -R $(whoami) ${userWorkspace}`, { stdio: "ignore" });

    if (fs.existsSync(fullRepoPath)) {
      sendLog(`⚠️ Repository already exists at: ${fullRepoPath}`);

      if (fs.existsSync(gitLockFile)) {
        sendLog(`⚠️ Stale Git lock file detected. Removing.`);
        fs.unlinkSync(gitLockFile);
      }

      try {
        sendLog(`🔄 Fetching latest changes from branch: ${branch}`);
        execSync(`git -C ${fullRepoPath} remote set-url origin ${repoUrl}`, {
          stdio: "pipe",
        });
        execSync(`git -C ${fullRepoPath} fetch --all --prune`, {
          stdio: "pipe",
        });

        // ✅ Handle Untracked Files Before Checkout
        sendLog(`🛠️ Checking for untracked files before checkout...`);
        const statusOutput = execSync(
          `git -C ${fullRepoPath} status --porcelain`,
          { encoding: "utf-8" }
        ).trim();
        if (statusOutput.length > 0) {
          sendLog(`⚠️ Untracked changes detected! Cleaning workspace.`);
          execSync(`git -C ${fullRepoPath} reset --hard`, { stdio: "pipe" });
          execSync(`git -C ${fullRepoPath} clean -fd`, { stdio: "pipe" });
        }

        // ✅ Ensure branch exists before checkout
        const branches = execSync(`git -C ${fullRepoPath} branch -r`, {
          encoding: "utf-8",
        });
        if (!branches.includes(`origin/${branch}`)) {
          throw new Error(`Branch '${branch}' does not exist on remote.`);
        }

        sendLog(`⚙️ Checking out branch '${branch}'`);
        execSync(
          `git -C ${fullRepoPath} checkout -B ${branch} origin/${branch}`,
          { stdio: "pipe" }
        );

        sendLog(`⚙️ Pulling latest changes`);
        execSync(`git -C ${fullRepoPath} pull origin ${branch} --ff-only`, {
          stdio: "pipe",
        });

        sendLog(`✅ Repository updated successfully.`);
      } catch (error) {
        const receivedError = error instanceof Error ? error.message : error;
        sendLog(`❌ ERROR: Failed to update repository: ${receivedError}`);
        sendLog(`🗑 Removing corrupted repo and retrying fresh clone...`);

        fs.rmSync(fullRepoPath, { recursive: true, force: true });

        sendLog(`🚀 Cloning fresh repository: ${repoUrl} (branch: ${branch})`);
        execSync(
          `git clone --branch ${branch} --depth=1 ${repoUrl} ${fullRepoPath}`,
          { stdio: "pipe" }
        );
      }
    } else {
      sendLog(`🚀 Cloning repository: ${repoUrl} (branch: ${branch})`);
      execSync(
        `git clone --branch ${branch} --depth=1 ${repoUrl} ${fullRepoPath}`,
        { stdio: "pipe" }
      );
    }

    // ✅ Ensure repoPath exists
    const projectDir = repoPath
      ? path.resolve(fullRepoPath, repoPath)
      : fullRepoPath;
    if (!fs.existsSync(projectDir)) {
      sendLog(`❌ ERROR: Specified repoPath does not exist: ${projectDir}`);
      io.to(sessionId).emit("repo-clone-status", {
        success: false,
        error: "Invalid repoPath.",
      });
      throw new Error(
        "Invalid repoPath: The specified directory does not exist."
      );
    }

    // ✅ Ensure pom.xml exists
    const pomFilePath = pomPath
      ? path.join(fullRepoPath, pomPath)
      : path.join(projectDir, "pom.xml");
    if (!fs.existsSync(pomFilePath)) {
      sendLog(`❌ ERROR: No pom.xml found at ${pomFilePath}.`);
      io.to(sessionId).emit("repo-clone-status", {
        success: false,
        error: "pom.xml not found.",
      });
      throw new Error("Invalid project: A valid pom.xml file is required.");
    }

    setJavaProjectPath(sessionId, projectDir);
    sendLog(`✅ Repository cloned/updated and set for session: ${sessionId}`);

    // ✅ Emit WebSocket event for success
    io.to(sessionId).emit("repo-clone-status", {
      success: true,
      repoPath: fullRepoPath,
    });

    return projectDir;
  } catch (error) {
    const recivedError = error instanceof Error ? error.message : error;

    sendLog(`❌ ERROR: Clone process failed: ${recivedError}`);

    // ✅ Emit WebSocket event for failure
    io.to(sessionId).emit("repo-clone-status", {
      success: false,
      error: recivedError,
    });

    throw error;
  }
};
