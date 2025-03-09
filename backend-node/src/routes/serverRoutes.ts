import express, { Request, response, Response } from "express";
import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { v4 as uuidv4 } from "uuid";
import {
  DEFAULT_PROJECT_NAME,
  SESSION_WORKSPACE_DIR,
  setJavaProjectPath,
} from "../config/projectPaths";

import { getBuildMetrics, getMavenVersion } from "../services/mavenService";

import { execSync } from "child_process";
import cookieParser from "cookie-parser";
import multer from "multer";
import { Server } from "socket.io";
import {
  handleArtifactReset,
  handleDownloadArtifact,
  handleGetArtifacts,
} from "../services/artifactsService";
import { handleSetRepoPath } from "../services/repoService";
import {
  deleteProject,
  getUserProjects,
  selectProject,
} from "../services/projectService";
import { getSessionId } from "../services/sessionService";

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
  router.post("/get-session", (req: Request, res: Response): any =>
    getSessionId(req, res)
  );

  router.get("/artifacts", (req: Request, res: Response): any =>
    handleGetArtifacts(req, res, io)
  );

  router.post("/reset-artifacts", (req: Request, res: Response): any =>
    handleArtifactReset(req, res, io)
  );

  // ✅ API to Download Files
  router.get("/download", (req: Request, res: Response): any =>
    handleDownloadArtifact(req, res)
  );

  // ✅ API to Set Repository Path
  router.post("/set-repo-path", (req: Request, res: Response): any =>
    handleSetRepoPath(req, res)
  );

  //clone repository currently using websockets connection to clone repository

  // ✅ API Endpoint to Fetch Last Build Metrics
  router.get("/build-metrics", getBuildMetrics);

  /**
   * ✅ API Endpoint to Get User's Projects
   * @route GET /api/user-projects
   */
  router.get("/user-projects", (req: Request, res: Response): any =>
    getUserProjects(req, res)
  );

  router.post("/select-project", (req: Request, res: Response): any =>
    selectProject(req, res)
  );

  router.delete(
    "/delete-project",
    async (req: Request, res: Response): Promise<any> => deleteProject(req, res)
  );

  router.get("/maven-version", (req, res) => getMavenVersion(req, res));

  app.use("/api", router);
};

// Deprecated code
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

export default router;
