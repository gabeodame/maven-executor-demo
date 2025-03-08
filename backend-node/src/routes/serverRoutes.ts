import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { v4 as uuidv4 } from "uuid";
import {
  DEFAULT_PROJECT_NAME,
  SESSION_WORKSPACE_DIR,
  setJavaProjectPath,
} from "../config/projectPaths";
import { cloneRepository } from "../services/cloneRepository";
import { getBuildMetrics } from "../services/mavenService";

import { execSync } from "child_process";
import cookieParser from "cookie-parser";
import multer from "multer";
import { Server } from "socket.io";
import {
  handleArtifactReset,
  handleGetArtifacts,
} from "../services/artifactsService";

const router = express.Router();
router.use(cookieParser());
// ✅ API to Fetch Build Artifacts
/**
 * ✅ API to Fetch Build Artifacts
 * @route GET /api/artifacts
 * @group Artifacts - Operations to fetch build artifacts
 * @returns {object} 200 - An object containing build artifacts
 */

// router.get("/artifacts", (req: Request, res: Response, io: Server): any => {
//   const sessionId = req.headers["x-session-id"] as string;
//   const selectedProject = req.query.project as string; // Selected project
//   const requestedPath = req.query.path as string; // Subdirectory path

//   console.log(
//     `📂 Fetching artifacts for session: ${sessionId}, Project: ${selectedProject}`
//   );

//   if (!sessionId) {
//     console.log("❌ ERROR: No session ID provided!");
//     return res.status(400).json({ error: "Session ID is required" });
//   }

//   const sessionWorkspace = path.join("/app/workspaces", sessionId);
//   if (!fs.existsSync(sessionWorkspace)) {
//     console.log(`⚠️ WARNING: No workspace found for session ${sessionId}`);
//     return res.json({});
//   }

//   // ✅ Fetch a specific path (e.g., subdirectory in target)
//   if (requestedPath) {
//     const resolvedPath = path.join(sessionWorkspace, requestedPath);
//     if (!fs.existsSync(resolvedPath)) {
//       console.log(`⚠️ WARNING: Requested path does not exist: ${resolvedPath}`);
//       return res.status(404).json({ error: "Requested path not found." });
//     }

//     console.log(`📂 Fetching contents of subdirectory: ${resolvedPath}`);
//     return res.json({
//       [selectedProject]: getArtifactsRecursively(resolvedPath),
//     });
//   }

//   // ✅ If a project is specified, return its artifacts
//   if (selectedProject) {
//     const projectTargetDir = path.join(
//       sessionWorkspace,
//       selectedProject,
//       "target"
//     );
//     if (!fs.existsSync(projectTargetDir)) {
//       console.log(
//         `⚠️ WARNING: No target directory found for ${selectedProject}`
//       );
//       return res.json({ [selectedProject]: [] }); // ✅ Empty array instead of error
//     }

//     try {
//       // ✅ Clean old builds before returning artifacts
//       cleanOldBuilds(projectTargetDir);

//       const projectArtifacts = getArtifactsRecursively(projectTargetDir);
//       console.log(
//         `📂 [SESSION: ${sessionId}] Found artifacts in: ${projectTargetDir}`
//       );

//       // ✅ Send updates to Redux store for UI refresh
//       io.to(sessionId).emit("artifacts-updated", {
//         project: selectedProject,
//         artifacts: projectArtifacts,
//       });

//       return res.json({ [selectedProject]: projectArtifacts });
//     } catch (error) {
//       console.error(
//         `❌ ERROR: Failed to read artifacts for ${selectedProject}:`,
//         error
//       );
//       return res.status(500).json({ error: "Failed to retrieve artifacts." });
//     }
//   }

//   // ✅ If no project is specified, return all projects' artifacts
//   const projects = fs
//     .readdirSync(sessionWorkspace, { withFileTypes: true })
//     .filter((dir) => dir.isDirectory())
//     .map((dir) => dir.name);

//   const artifacts: Record<string, any> = {};

//   for (const projectName of projects) {
//     const projectTargetDir = path.join(sessionWorkspace, projectName, "target");
//     if (!fs.existsSync(projectTargetDir)) {
//       console.log(`⚠️ WARNING: No target directory found for ${projectName}`);
//       artifacts[projectName] = [];
//       continue;
//     }

//     try {
//       // ✅ Clean up before returning results
//       cleanOldBuilds(projectTargetDir);

//       artifacts[projectName] = getArtifactsRecursively(projectTargetDir);
//       console.log(
//         `📂 [SESSION: ${sessionId}] Found artifacts in: ${projectTargetDir}`
//       );
//     } catch (error) {
//       console.error(
//         `❌ ERROR: Failed to read artifacts for ${projectName}:`,
//         error
//       );
//       artifacts[projectName] = [];
//     }
//   }

//   return res.json(artifacts);
// });

export const setupServerRoutes = (app: express.Application, io: Server) => {
  router.get("/artifacts", (req: Request, res: Response): any =>
    handleGetArtifacts(req, res, io)
  );

  router.post("/reset-artifacts", (req: Request, res: Response): any => {
    handleArtifactReset(req, res, io);
  });

  app.use("/api", router);
};

// ✅ API to Download Files

router.get("/download", (req: Request, res: Response): any => {
  const filePath = req.query.file as string;

  if (!filePath) {
    return res.status(400).json({ error: "File path is required" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const fileName = path.basename(filePath);

  // ✅ Set headers to force file download
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "application/octet-stream");

  console.log(`📥 Downloading file: ${filePath}`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// ✅ API to Set Repository Path
router.post("/set-repo-path", (req: Request, res: Response): any => {
  const sessionId = req.headers["x-session-id"] as string;
  const { repoPath } = req.body;

  console.log(`🔍 Received repo path update request for session: ${sessionId}`);

  if (!sessionId) {
    console.log("❌ ERROR: No session ID provided!");
    return res.status(400).json({ error: "Session ID is required" });
  }

  if (!repoPath || !fs.existsSync(repoPath)) {
    console.log(`❌ Invalid repo path: ${repoPath}`);
    return res.status(400).json({ error: "Invalid repository path" });
  }

  // ✅ Set project path per session
  setJavaProjectPath(sessionId, repoPath);
  console.log(
    `✅ [SESSION: ${sessionId}] Java project path updated to: ${repoPath}`
  );

  // ✅ Save session paths for debugging
  const logFilePath = path.join("/tmp/sessions", sessionId, "repoPath.log");
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  fs.writeFileSync(logFilePath, `JAVA_PROJECT_PATH=${repoPath}\n`);

  return res.status(200).json({
    message: "Repository path updated successfully",
    sessionId,
    repoPath,
  });
});

// ✅ API Endpoint to Fetch Last Build Metrics
router.get("/build-metrics", getBuildMetrics);

// ✅ Configure Multer for file uploads
const upload = multer({ dest: "/tmp/uploads/" });

router.post(
  "/upload-java-project",
  upload.single("file"),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const uploadPath = req.file.path; // Path of the uploaded zip file
    const extractDir = "/app/demo-java-app";
    const sessionId = req.headers["x-session-id"] as string;

    try {
      // ✅ Ensure the extract directory is empty
      if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true, force: true });
      }
      fs.mkdirSync(extractDir, { recursive: true });

      // ✅ Extract the ZIP file
      await fs
        .createReadStream(uploadPath)
        .pipe(unzipper.Extract({ path: extractDir }))
        .promise();
      setJavaProjectPath(sessionId, extractDir);

      console.log(`✅ Extracted Java Project to: ${extractDir}`);
      res.json({ success: true, path: extractDir });
    } catch (error) {
      console.error("❌ Error extracting project:", error);
      res.status(500).json({ error: "Failed to extract Java project" });
    } finally {
      // ✅ Cleanup temp uploaded file
      fs.unlinkSync(uploadPath);
    }
  }
);

/**
 * ✅ API to Retrieve the User's Session ID
 * - Returns existing session ID from `x-session-id` header or cookies
 */

const AUTH_SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days for authenticated users
const GUEST_SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes for guest users

const sessionCache = new Map<
  string,
  { sessionId: string; expiresAt: number }
>(); // 🔹 In-memory session store

router.post("/get-session", async (req, res): Promise<any> => {
  try {
    let sessionId =
      (req.headers["x-session-id"] as string) || req.cookies?.sessionId;
    let sessionExpiry = GUEST_SESSION_EXPIRY; // Default to guest session expiry

    // ✅ 1. If session exists in cache, validate and return it
    if (sessionId && sessionCache.has(sessionId)) {
      const cachedSession = sessionCache.get(sessionId);
      if (cachedSession && cachedSession.expiresAt > Date.now()) {
        console.log(`✅ Using Cached Session: ${sessionId}`);
        return res.json({ sessionId });
      } else {
        console.log(`⚠️ Expired session detected, creating a new one.`);
        sessionCache.delete(sessionId);
      }
    }

    // ✅ 2. Determine if this is an authenticated session
    if (sessionId && !sessionId.startsWith("guest-")) {
      sessionExpiry = AUTH_SESSION_EXPIRY; // Set longer session expiry for authenticated users
      console.log(
        `✅ Authenticated User Session Detected: ${sessionId} (Expiry: 7 days)`
      );
    } else {
      // ✅ 3. If no valid session ID, create a new guest session
      sessionId = `guest-${uuidv4().slice(0, 10)}`;
      console.log(
        `✅ New Guest Session Created: ${sessionId} (Expiry: 30 minutes)`
      );
    }

    // ✅ 4. Store session in cookies (appropriate expiry based on user type)
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionExpiry,
    });

    // ✅ 5. Store session in cache for quick retrieval
    sessionCache.set(sessionId, {
      sessionId,
      expiresAt: Date.now() + sessionExpiry,
    });

    res.json({ sessionId });
  } catch (error) {
    console.error("❌ Error retrieving session ID:", error);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

//clone Repository
router.post(
  "/clone-repo",
  async (req: Request, res: Response): Promise<any> => {
    const {
      repoUrl,
      branch = "main",
      projectName,
      repoPath,
      pomPath,
    } = req.body;
    const sessionId = req.headers["x-session-id"] as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    if (!repoUrl || !repoUrl.startsWith("http")) {
      return res.status(400).json({ error: "Invalid repository URL" });
    }

    const safeRepoName =
      projectName?.replace(/[^a-zA-Z0-9-_]/g, "") ||
      path.basename(repoUrl, ".git");
    const fullRepoPath = path.join(
      SESSION_WORKSPACE_DIR,
      sessionId,
      safeRepoName
    );

    console.log(`📂 Cloning repo: ${repoUrl} on branch ${branch}`);

    try {
      const clonedPath = await cloneRepository(
        repoUrl,
        branch,
        sessionId,
        safeRepoName,
        repoPath,
        pomPath
      );

      // ✅ Validate successful cloning
      if (!fs.existsSync(clonedPath)) {
        throw new Error("Clone operation failed.");
      }

      return res.json({ success: true, sessionId, repoPath: clonedPath });
    } catch (error) {
      console.error("❌ ERROR: Failed to clone repository", error);

      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  }
);

router.post("/select-project", (req: Request, res: Response): any => {
  const { projectName } = req.body;
  const sessionId = req.headers["x-session-id"] as string;

  if (!sessionId || !projectName) {
    return res
      .status(400)
      .json({ error: "Missing session ID or project name" });
  }

  const safeProjectName = projectName.replace(/[^a-zA-Z0-9-_]/g, ""); // Sanitize input
  const projectPath = path.join(
    SESSION_WORKSPACE_DIR,
    sessionId,
    safeProjectName
  );

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: "Project does not exist" });
  }

  setJavaProjectPath(sessionId, projectPath);
  return res.json({ success: true, projectPath });
});

/**
 * ✅ API Endpoint to Get User's Projects
 * @route GET /api/user-projects
 */
router.get("/user-projects", (req: Request, res: Response): any => {
  const sessionId = req.headers["x-session-id"] as string;

  if (!sessionId) {
    console.log("❌ ERROR: No session ID provided!");
    return res.status(400).json({ error: "Session ID is required" });
  }

  const sessionWorkspace = path.join(SESSION_WORKSPACE_DIR, sessionId);
  console.log(`📂 Checking workspace for session: ${sessionId}`);

  // ✅ Ensure session workspace exists
  if (!fs.existsSync(sessionWorkspace)) {
    console.warn(
      `⚠️ WARNING: No workspace found for session ${sessionId}. Creating one.`
    );
    fs.mkdirSync(sessionWorkspace, { recursive: true });
  }

  // ✅ Ensure `demo-java-app` exists inside workspace
  const defaultProjectPath = path.join(sessionWorkspace, DEFAULT_PROJECT_NAME);
  if (!fs.existsSync(defaultProjectPath)) {
    console.log(`🚀 Setting up default project for session: ${sessionId}`);
    fs.mkdirSync(defaultProjectPath, { recursive: true });
    execSync(`cp -r /app/demo-java-app/* ${defaultProjectPath}`, {
      stdio: "inherit",
    });
  }

  console.log(`📂 Checking workspace at path: ${sessionWorkspace}`);
  console.log(`📂 Looking for projects inside: ${sessionWorkspace}`);

  try {
    // ✅ Read all projects (directories) inside the workspace
    const projects = fs
      .readdirSync(sessionWorkspace, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    // ✅ Ensure `demo-java-app` is included
    if (!projects.includes(DEFAULT_PROJECT_NAME)) {
      projects.unshift(DEFAULT_PROJECT_NAME);
    }

    console.log(`📂 Projects for session ${sessionId}:`, projects);
    return res.json(projects);
  } catch (error) {
    console.error(
      `❌ ERROR: Failed to list projects for session ${sessionId}`,
      error
    );
    return res.status(500).json({ error: "Failed to retrieve projects" });
  }
});

router.delete(
  "/delete-project",
  async (req: Request, res: Response): Promise<any> => {
    const { projectName } = req.body;
    const sessionId = req.headers["x-session-id"] as string;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }
    if (!projectName || projectName === "demo-java-app") {
      return res.status(400).json({ error: "Project name is required" });
    }

    const projectPath = path.join(
      SESSION_WORKSPACE_DIR,
      sessionId,
      projectName
    );

    // ✅ Ensure project exists before deleting
    if (!fs.existsSync(projectPath)) {
      console.log(`⚠️ Project ${projectName} does not exist.`);
      return res.status(404).json({ error: "Project not found" });
    }

    try {
      // ✅ Recursively delete project folder
      fs.rmSync(projectPath, { recursive: true, force: true });
      console.log(`🗑️ Project ${projectName} deleted successfully.`);

      return res.json({
        success: true,
        message: `Project ${projectName} deleted`,
      });
    } catch (error) {
      console.error(`❌ Error deleting project ${projectName}:`, error);
      return res.status(500).json({ error: "Failed to delete project" });
    }
  }
);

// API route to get Maven version
router.get("/maven-version", async (req, res) => {
  try {
    const mvnVersionOutput = execSync("mvn -version", {
      encoding: "utf-8",
    }).split("\n")[0];

    // Extract only the version number (e.g., "3.9.9")
    const match = mvnVersionOutput.match(/Apache Maven (\d+\.\d+\.\d+)/);
    const cleanVersion = match ? `Maven ${match[1]}` : "Maven: Unknown";

    res.json({ version: cleanVersion });
  } catch (error) {
    res.json({ version: "Maven: Unknown" });
  }
});
export default router;
