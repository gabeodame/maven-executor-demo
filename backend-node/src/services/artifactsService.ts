import fs from "fs";
import path from "path";
import { Artifact } from "../types/types";
import { Server } from "socket.io";

/**
 * Recursively fetches artifacts in the specified directory.
 */
const getArtifactsRecursively = (dirPath: string): Artifact[] => {
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath, { withFileTypes: true }).map((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    const stats = fs.statSync(fullPath);

    return {
      name: entry.name,
      path: fullPath,
      size: entry.isFile() ? stats.size : undefined,
      type: entry.isDirectory() ? "directory" : "file",
      modifiedAt: stats.mtime.toISOString(),
      children: entry.isDirectory() ? getArtifactsRecursively(fullPath) : [],
    };
  });
};

const MAX_BUILDS = 2; // ✅ Keeps only the latest 3 builds

const cleanOldBuilds = (targetPath: string) => {
  if (!fs.existsSync(targetPath)) return;

  // ✅ List only build directories
  const buildDirs = fs
    .readdirSync(targetPath, { withFileTypes: true })
    .filter((dir) => dir.isDirectory() && dir.name.startsWith("build-"))
    .map((dir) => ({
      name: dir.name,
      fullPath: path.join(targetPath, dir.name),
      createdAt: fs.statSync(path.join(targetPath, dir.name)).ctimeMs,
    }))
    .sort((a, b) => b.createdAt - a.createdAt); // ✅ Sort descending by creation time

  // ✅ Remove old builds beyond MAX_BUILDS
  if (buildDirs.length > MAX_BUILDS) {
    const oldBuilds = buildDirs.slice(MAX_BUILDS);
    oldBuilds.forEach(({ fullPath }) => {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`🗑 Removed old build: ${fullPath}`);
    });
  }
};

import { Request, Response } from "express";

export const handleGetArtifacts = (req: Request, res: Response, io: Server) => {
  const sessionId = req.headers["x-session-id"] as string | undefined;
  const selectedProject = req.query.project as string; // Selected project
  const requestedPath = req.query.path as string; // Subdirectory path

  console.log(
    `📂 Fetching artifacts for session: ${sessionId}, Project: ${selectedProject}`
  );

  if (!sessionId) {
    console.log("❌ ERROR: No session ID provided!");
    return res.status(400).json({ error: "Session ID is required" });
  }

  const sessionWorkspace = path.join("/app/workspaces", sessionId);
  if (!fs.existsSync(sessionWorkspace)) {
    console.log(`⚠️ WARNING: No workspace found for session ${sessionId}`);
    return res.json({});
  }

  // ✅ Fetch a specific path (e.g., subdirectory in target)
  if (requestedPath) {
    const resolvedPath = path.join(sessionWorkspace, requestedPath);
    if (!fs.existsSync(resolvedPath)) {
      console.log(`⚠️ WARNING: Requested path does not exist: ${resolvedPath}`);
      return res.status(404).json({ error: "Requested path not found." });
    }

    console.log(`📂 Fetching contents of subdirectory: ${resolvedPath}`);
    return res.json({
      [selectedProject]: getArtifactsRecursively(resolvedPath),
    });
  }

  // ✅ If a project is specified, return its artifacts
  if (selectedProject) {
    const projectTargetDir = path.join(
      sessionWorkspace,
      selectedProject,
      "target"
    );
    if (!fs.existsSync(projectTargetDir)) {
      console.log(
        `⚠️ WARNING: No target directory found for ${selectedProject}`
      );
      return res.json({ [selectedProject]: [] }); // ✅ Empty array instead of error
    }

    try {
      // ✅ Clean old builds before returning artifacts
      cleanOldBuilds(projectTargetDir);

      const projectArtifacts = getArtifactsRecursively(projectTargetDir);
      console.log(
        `📂 [SESSION: ${sessionId}] Found artifacts in: ${projectTargetDir}`
      );

      // ✅ Send updates to Redux store for UI refresh
      io.to(sessionId).emit("artifacts-updated", {
        project: selectedProject,
        artifacts: projectArtifacts,
      });

      return res.json({ [selectedProject]: projectArtifacts });
    } catch (error) {
      console.error(
        `❌ ERROR: Failed to read artifacts for ${selectedProject}:`,
        error
      );
      return res.status(500).json({ error: "Failed to retrieve artifacts." });
    }
  }

  // ✅ If no project is specified, return all projects' artifacts
  const projects = fs
    .readdirSync(sessionWorkspace, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

  const artifacts: Record<string, any> = {};

  for (const projectName of projects) {
    const projectTargetDir = path.join(sessionWorkspace, projectName, "target");
    if (!fs.existsSync(projectTargetDir)) {
      console.log(`⚠️ WARNING: No target directory found for ${projectName}`);
      artifacts[projectName] = [];
      continue;
    }

    try {
      // ✅ Clean up before returning results
      cleanOldBuilds(projectTargetDir);

      artifacts[projectName] = getArtifactsRecursively(projectTargetDir);
      console.log(
        `📂 [SESSION: ${sessionId}] Found artifacts in: ${projectTargetDir}`
      );
    } catch (error) {
      console.error(
        `❌ ERROR: Failed to read artifacts for ${projectName}:`,
        error
      );
      artifacts[projectName] = [];
    }
  }

  return res.json(artifacts);
};

export const handleArtifactReset = (
  req: Request,
  res: Response,
  io: Server
) => {
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
};

export const handleDownloadArtifact = (req: Request, res: Response) => {
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
};
