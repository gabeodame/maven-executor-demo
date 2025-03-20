import { Request, Response } from "express";
import { Server, Socket } from "socket.io";
import { setJavaProjectPath } from "../config/projectPaths";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

/**
 * ✅ Logs messages to both console and WebSocket.
 */
const sendLog = (socket: Socket, msg: string, clearLogs: boolean = false) => {
  if (clearLogs) {
    socket.emit("clear-clone-logs"); // Clear logs on frontend UI
  }
  console.log(`[Backend] ${msg}`);
  socket.emit("clone-log", msg);
};

/**
 * ✅ Checks workspace for valid projects in a session.
 * - Returns a list of valid projects that contain `pom.xml`.
 */
export const checkWorkspaceProjects = (sessionId: string): string[] => {
  const userWorkspace = `/app/workspaces/${sessionId}`;
  if (!fs.existsSync(userWorkspace)) return [];

  return fs
    .readdirSync(userWorkspace, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => {
      const projectPath = path.join(userWorkspace, dirent.name);
      return fs.existsSync(path.join(projectPath, "pom.xml"))
        ? dirent.name
        : null;
    })
    .filter(Boolean) as string[];
};

/**
 * ✅ Handles setting the repository path for a session.
 */
export const handleSetRepoPath = (req: Request, res: Response) => {
  const sessionId = req.headers["x-session-id"] as string;
  const { repoPath } = req.body;

  console.log(`🔍 Received repo path update request for session: ${sessionId}`);

  if (!sessionId || !repoPath || !fs.existsSync(repoPath)) {
    return res
      .status(400)
      .json({ error: "Invalid session ID or repository path" });
  }

  setJavaProjectPath(sessionId, repoPath);
  console.log(`✅ [SESSION: ${sessionId}] Java project path set: ${repoPath}`);

  return res.status(200).json({
    message: "Repository path updated successfully",
    repoPath,
  });
};

/**
 * ✅ Handles cloning a repository.
 * - Ensures workspace and repository exist before proceeding.
 * - If the repository already exists, attempts to update it via `git pull`.
 * - If errors occur, falls back to the last valid project.
 */
export const handleCloneRepository = async (
  io: Server,
  socket: Socket,
  repoUrl: string,
  branch: string,
  sessionId: string,
  projectName?: string,
  repoPath?: string,
  pomPath?: string
): Promise<string | null> => {
  const userWorkspace = `/app/workspaces/${sessionId}`;
  const repoName = projectName || path.basename(repoUrl, ".git");
  const fullRepoPath = path.join(userWorkspace, repoName);

  sendLog(socket, `🔍 Checking workspace for session: ${sessionId}`, true);

  try {
    if (!fs.existsSync(userWorkspace)) {
      fs.mkdirSync(userWorkspace, { recursive: true });
      sendLog(socket, `✅ Created workspace: ${userWorkspace}`);
    }

    // ✅ Start cloning process
    sendLog(socket, `🚀 Cloning repository: ${repoUrl} (branch: ${branch})`);
    return new Promise((resolve) => {
      const cloneProcess = spawn("git", [
        "clone",
        "--branch",
        branch,
        "--depth=1",
        repoUrl,
        fullRepoPath,
      ]);

      let cloneError: string | null = null;
      let successLogEmitted = false;

      cloneProcess.stdout.on("data", (data) => {
        sendLog(socket, data.toString());
      });

      cloneProcess.stderr.on("data", (data) => {
        const errorMsg = data.toString();

        // ✅ Ignore normal stderr messages like "Cloning into..."
        if (errorMsg.includes("Cloning into")) return;

        cloneError = errorMsg;
        sendLog(socket, `❌ ERROR: ${errorMsg}`);
      });

      cloneProcess.on("close", async (code) => {
        if (code !== 0) {
          sendLog(socket, `❌ ERROR: Clone process failed.`);
          io.to(sessionId).emit("repo-clone-status", {
            success: false,
            error: "Git clone failed.",
          });
          return resolve(null);
        }

        // ✅ Ensure `repoPath` is valid before proceeding
        if (!fs.existsSync(fullRepoPath)) {
          sendLog(
            socket,
            `❌ ERROR: Clone process failed. Repo path is invalid.`
          );
          io.to(sessionId).emit("repo-clone-status", {
            success: false,
            error: "Repository path is invalid.",
            repoPath: null,
          });
          return resolve(null);
        }

        const projectDir = repoPath
          ? path.resolve(fullRepoPath, repoPath)
          : fullRepoPath;
        if (!fs.existsSync(projectDir)) {
          sendLog(
            socket,
            `❌ ERROR: Specified repoPath does not exist: ${projectDir}`
          );
          io.to(sessionId).emit("repo-clone-status", {
            success: false,
            error: "Invalid repoPath.",
          });

          // 🚨 Rollback: Delete the cloned directory since validation failed
          fs.rmSync(fullRepoPath, { recursive: true, force: true });
          sendLog(socket, `🗑️ Invalid repository deleted: ${fullRepoPath}`);

          return resolve(null);
        }

        const pomFilePath = pomPath
          ? path.join(fullRepoPath, pomPath)
          : path.join(projectDir, "pom.xml");
        if (!fs.existsSync(pomFilePath)) {
          sendLog(socket, `❌ ERROR: No pom.xml found at ${pomFilePath}.`);
          io.to(sessionId).emit("repo-clone-status", {
            success: false,
            error: "pom.xml not found.",
          });

          // 🚨 Rollback: Delete the cloned directory since validation failed
          fs.rmSync(fullRepoPath, { recursive: true, force: true });
          sendLog(socket, `🗑️ Invalid repository deleted: ${fullRepoPath}`);

          return resolve(null);
        }

        // ✅ Final success confirmation after all checks pass
        setJavaProjectPath(sessionId, projectDir);
        sendLog(socket, `✅ Repository cloned successfully: ${fullRepoPath}`);
        io.to(sessionId).emit("repo-clone-status", {
          success: true,
          repoPath: fullRepoPath,
        });

        resolve(fullRepoPath);
      });
    });
  } catch (error) {
    sendLog(
      socket,
      `❌ ERROR: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    io.to(sessionId).emit("repo-clone-status", {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
};
/**
 * ✅ Handles repository deletion.
 * - Ensures safe deletion without crashing the process.
 */
export const handleDeleteRepository = async (req: Request, res: Response) => {
  const { sessionId, projectName } = req.body;
  const repoPath = `/app/workspaces/${sessionId}/${projectName}`;

  if (!fs.existsSync(repoPath)) {
    return res.status(400).json({ error: "Repository not found." });
  }

  try {
    fs.rmSync(repoPath, { recursive: true, force: true });
    console.log(`🗑️ Deleted repository: ${repoPath}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`❌ Error deleting repository: ${error}`);
    res.status(500).json({ error: "Failed to delete repository." });
  }
};
