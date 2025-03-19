import { execSync } from "child_process";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import {
  SESSION_WORKSPACE_DIR,
  DEFAULT_PROJECT_NAME,
  setJavaProjectPath,
} from "../config/projectPaths";

export const getUserProjects = (req: Request, res: Response) => {
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
};

export const selectProject = (req: Request, res: Response) => {
  const { project } = req.body;
  const sessionId = req.headers["x-session-id"] as string;
  console.log(
    `🔍 Received project selection request for session: ${sessionId}`
  );

  if (!sessionId || !project) {
    console.log("❌ ERROR: Missing session ID or project name");
    return res
      .status(400)
      .json({ error: "Missing session ID or project name" });
  }

  const safeProjectName = project.replace(/[^a-zA-Z0-9-_]/g, ""); // Sanitize input
  const projectPath = path.join(
    SESSION_WORKSPACE_DIR,
    sessionId,
    safeProjectName
  );

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: "Project does not exist" });
  }

  setJavaProjectPath(sessionId, projectPath);
  console.log(`✅ [SESSION: ${sessionId}] Selected project: ${projectPath}`);
  return res.json({ success: true, projectPath });
};

export const deleteProject = (req: Request, res: Response) => {
  const { projectName } = req.body;

  if (!projectName?.length) {
    return res.status(400).json({ error: "Project name is required" });
  }

  console.log(`🗑️ Received delete project request: ${projectName}`);
  const sessionId = req.headers["x-session-id"] as string;
  console.log("🔍 Received project deletion request for session:", sessionId);

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }
  if (projectName === DEFAULT_PROJECT_NAME) {
    return res.status(400).json({ error: "Cannot delete default project" });
  }
  if (!projectName || projectName === "demo-java-app") {
    return res.status(400).json({ error: "Project name is required" });
  }

  const projectPath = path.join(SESSION_WORKSPACE_DIR, sessionId, projectName);

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
};
