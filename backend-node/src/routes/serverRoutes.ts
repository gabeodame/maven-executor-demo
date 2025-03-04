import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import {
  getJavaProjectPath,
  SESSION_WORKSPACE_DIR,
  setJavaProjectPath,
  DEFAULT_PROJECT_NAME,
} from "../config/projectPaths";
import { getBuildMetrics } from "../services/mavenService";
import { cloneRepository } from "../services/gitService";
import { v4 as uuidv4 } from "uuid";
import unzipper from "unzipper";

import multer from "multer";
import { getSessionId } from "../services/sessionService";
import { execSync } from "child_process";

const router = express.Router();

// ✅ API to Fetch Build Artifacts
/**
 * ✅ API to Fetch Build Artifacts
 * @route GET /api/artifacts
 * @group Artifacts - Operations to fetch build artifacts
 * @returns {object} 200 - An object containing build artifacts
 */
router.get("/artifacts", (req: Request, res: Response): any => {
  const sessionId = req.headers["x-session-id"] as string;
  console.log(`📂 Fetching artifacts for session: ${sessionId}`);

  if (!sessionId) {
    console.log("❌ ERROR: No session ID provided!");
    return res.status(400).json({ error: "Session ID is required" });
  }

  // ✅ Retrieve the session workspace
  const sessionWorkspace = path.join("/app/workspaces", sessionId);

  if (!fs.existsSync(sessionWorkspace)) {
    console.log(`⚠️ WARNING: No workspace found for session ${sessionId}`);
    return res.json({});
  }

  const projects = fs
    .readdirSync(sessionWorkspace, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

  const artifacts: Record<string, any> = {};

  // ✅ Iterate through projects and fetch target artifacts
  for (const projectName of projects) {
    const projectTargetDir = path.join(sessionWorkspace, projectName, "target");

    if (!fs.existsSync(projectTargetDir)) {
      console.log(`⚠️ WARNING: No target directory found for ${projectName}`);
      continue;
    }

    try {
      artifacts[projectName] = fs
        .readdirSync(projectTargetDir, { withFileTypes: true })
        .map((entry) => ({
          name: entry.name,
          isDirectory: entry.isDirectory(),
          path: path.join(projectTargetDir, entry.name),
        }));

      console.log(
        `📂 [SESSION: ${sessionId}] Found artifacts in: ${projectTargetDir}`
      );
    } catch (error) {
      console.error(
        `❌ ERROR: Failed to read artifacts for ${projectName}:`,
        error
      );
    }
  }

  return res.json(artifacts);
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
router.get("/get-session", async (req, res) => {
  try {
    let sessionId = req.headers["x-session-id"] as string;

    // ✅ Prioritize session ID from the frontend (NextAuth)
    if (!sessionId) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];

        // ✅ Validate token and extract session ID (NextAuth user ID)
        const sessionRes = await fetch(
          `${process.env.NEXT_PUBLIC_VITE_API_URL}/api/auth/session`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.id) {
          sessionId = sessionData.user.id;
          console.log(`✅ Authenticated Session Detected: ${sessionId}`);
        }
      }
    }

    // ✅ Fallback: Use cookie session if available
    if (!sessionId) {
      sessionId = req.cookies?.sessionId;
    }

    // ✅ If no session ID, generate guest session
    if (!sessionId) {
      sessionId = `guest-${uuidv4().slice(0, 10)}`;
      console.log(`✅ New Guest Session Created: ${sessionId}`);
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    res.json({ sessionId });
  } catch (error) {
    console.error("❌ Error retrieving session ID:", error);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
});

router.post(
  "/clone-repo",
  async (req: Request, res: Response): Promise<any> => {
    const { repoUrl, branch = "main", projectName } = req.body;
    const sessionId =
      (req.headers["x-session-id"] as string) || getSessionId(req, res);

    if (!repoUrl) {
      return res.status(400).json({ error: "Missing repository URL" });
    }

    const repoName = projectName || path.basename(repoUrl, ".git"); // Allow user to specify or default to repo name
    const repoPath = `/app/workspaces/${sessionId}/${repoName}`;

    console.log(
      `📂 Processing clone for session: ${sessionId} with project: ${repoName}`
    );

    try {
      const clonedPath = cloneRepository(repoUrl, branch, sessionId, repoName);
      setJavaProjectPath(sessionId, clonedPath);
      res.json({ success: true, repoPath: clonedPath, sessionId });
    } catch (error) {
      console.error("❌ ERROR: Failed to clone repository", error);
      res.status(500).json({ error: "Failed to clone repository" });
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

  const projectPath = `/app/workspaces/${sessionId}/${projectName}`;
  if (!fs.existsSync(projectPath)) {
    return res.status(400).json({ error: "Project does not exist" });
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
