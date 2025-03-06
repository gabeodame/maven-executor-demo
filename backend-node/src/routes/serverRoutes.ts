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
import { cloneRepository } from "../services/gitService";
import { getBuildMetrics } from "../services/mavenService";

import { execSync } from "child_process";
import cookieParser from "cookie-parser";
import multer from "multer";

const router = express.Router();
router.use(cookieParser());
// ✅ API to Fetch Build Artifacts
/**
 * ✅ API to Fetch Build Artifacts
 * @route GET /api/artifacts
 * @group Artifacts - Operations to fetch build artifacts
 * @returns {object} 200 - An object containing build artifacts
 */

const getArtifactsRecursively = (dirPath: string): any[] => {
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath, { withFileTypes: true }).map((entry) => ({
    name: entry.name,
    isDirectory: entry.isDirectory(),
    path: path.join(dirPath, entry.name),
    children: entry.isDirectory()
      ? getArtifactsRecursively(path.join(dirPath, entry.name))
      : undefined, // Recursive fetch
  }));
};

const MAX_BUILDS = 3; // ✅ Keeps only the latest 3 builds

const cleanOldBuilds = (targetPath: string) => {
  if (!fs.existsSync(targetPath)) return;

  const buildDirs = fs
    .readdirSync(targetPath, { withFileTypes: true })
    .filter((dir) => dir.isDirectory() && dir.name.startsWith("build-"))
    .sort((a, b) => (a.name > b.name ? -1 : 1)); // Sort by name (latest first)

  if (buildDirs.length > MAX_BUILDS) {
    const oldBuilds = buildDirs.slice(MAX_BUILDS); // Keep only the latest MAX_BUILDS
    oldBuilds.forEach((oldBuild) => {
      const buildPath = path.join(targetPath, oldBuild.name);
      fs.rmSync(buildPath, { recursive: true, force: true });
      console.log(`🗑️ Deleted old build: ${buildPath}`);
    });
  }
};

router.get("/artifacts", (req: Request, res: Response): any => {
  const sessionId = req.headers["x-session-id"] as string;
  const requestedPath = req.query.path as string; // Subdirectory path

  console.log(`📂 Fetching artifacts for session: ${sessionId}`);

  if (!sessionId) {
    console.log("❌ ERROR: No session ID provided!");
    return res.status(400).json({ error: "Session ID is required" });
  }

  const sessionWorkspace = path.join("/app/workspaces", sessionId);
  if (!fs.existsSync(sessionWorkspace)) {
    console.log(`⚠️ WARNING: No workspace found for session ${sessionId}`);
    return res.json({});
  }

  // If a specific path is requested, return its contents directly
  if (requestedPath) {
    if (!fs.existsSync(requestedPath)) {
      console.log(
        `⚠️ WARNING: Requested path does not exist: ${requestedPath}`
      );
      return res.json([]);
    }

    console.log(`📂 Fetching contents of subdirectory: ${requestedPath}`);
    return res.json(getArtifactsRecursively(requestedPath)); // ✅ Only return requested subdirectory
  }

  // Default: Return all project artifacts
  const projects = fs
    .readdirSync(sessionWorkspace, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

  const artifacts: Record<string, any> = {};

  for (const projectName of projects) {
    const projectTargetDir = path.join(sessionWorkspace, projectName, "target");
    if (!fs.existsSync(projectTargetDir)) {
      console.log(`⚠️ WARNING: No target directory found for ${projectName}`);
      artifacts[projectName] = []; // ✅ Return an empty array if no artifacts
      continue;
    }

    try {
      artifacts[projectName] = getArtifactsRecursively(projectTargetDir);
      console.log(
        `📂 [SESSION: ${sessionId}] Found artifacts in: ${projectTargetDir}`
      );
    } catch (error) {
      console.error(
        `❌ ERROR: Failed to read artifacts for ${projectName}:`,
        error
      );
      artifacts[projectName] = []; // ✅ Prevent crashes, return empty array
    }
  }

  return res.json(artifacts);
});

router.post("/reset-artifacts", (req: Request, res: Response): any => {
  const sessionId = req.headers["x-session-id"] as string;
  const { project } = req.body;

  if (!sessionId || typeof sessionId !== "string") {
    console.error("❌ ERROR: Missing or invalid session ID.");
    return res
      .status(400)
      .json({ error: "Session ID is required and must be a string" });
  }

  if (!project || typeof project !== "string") {
    console.error("❌ ERROR: Missing or invalid project name.");
    return res
      .status(400)
      .json({ error: "Project name is required and must be a string" });
  }

  const projectTargetDir = path.join(
    "/app/workspaces",
    sessionId,
    project,
    "target"
  );

  if (!fs.existsSync(projectTargetDir)) {
    console.warn(`⚠️ No target directory found for ${project}`);
    return res.json({ success: true, message: "No artifacts to delete" });
  }

  try {
    fs.rmSync(projectTargetDir, { recursive: true, force: true });
    console.log(`🗑️ Cleared all artifacts for ${project}`);
    return res.json({ success: true });
  } catch (error) {
    console.error(`❌ ERROR: Failed to clear artifacts for ${project}:`, error);
    return res.status(500).json({ error: "Failed to clear artifacts" });
  }
});

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

router.post(
  "/clone-repo",
  async (req: Request, res: Response): Promise<any> => {
    const { repoUrl, branch = "main", projectName, pomPath } = req.body; // ✅ Accept pomPath
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

    const repoPath = path.join(SESSION_WORKSPACE_DIR, sessionId, safeRepoName);

    // ✅ Fix: Ensure pomPath is a string (fallback to default pom.xml)
    const pomFilePath = pomPath
      ? path.join(repoPath, pomPath)
      : path.join(repoPath, "pom.xml");

    // ✅ Check if repo already exists before cloning
    if (fs.existsSync(repoPath)) {
      console.log(`⚠️ Repo already exists: ${repoPath}`);
      return res.json({
        success: true,
        message: "Repository already cloned",
        sessionId,
      });
    }

    console.log(`📂 Cloning repo: ${repoUrl} on branch ${branch}`);

    try {
      const clonedPath = cloneRepository(
        repoUrl,
        branch,
        sessionId,
        safeRepoName
      );

      // ✅ Validate cloning success
      if (!fs.existsSync(clonedPath)) {
        throw new Error("Clone operation failed.");
      }

      // ✅ Ensure pom.xml exists at the specified path
      if (!fs.existsSync(pomFilePath)) {
        console.error(
          `❌ ERROR: No pom.xml found at ${pomFilePath}. Deleting repo.`
        );
        fs.rmSync(repoPath, { recursive: true, force: true });
        throw new Error(
          `Invalid project: pom.xml not found at ${
            pomPath || "default location"
          }`
        );
      }

      return res.json({ success: true, sessionId, pomPath: pomFilePath });
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
