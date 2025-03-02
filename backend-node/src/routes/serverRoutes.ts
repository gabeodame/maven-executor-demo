import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { getJavaProjectPath, setJavaProjectPath } from "../config/projectPaths";
import { getBuildMetrics } from "../services/mavenService";
import { cloneRepository } from "../services/gitService";

import unzipper from "unzipper";

import multer from "multer";

const router = express.Router();

router.get("/artifacts", (req: Request, res: Response): any => {
  const JAVA_PROJECT_PATH = getJavaProjectPath();
  const requestedPath = req.query.path as string | undefined;

  // ✅ Ensure target directory resolves correctly
  const targetDir = requestedPath
    ? path.join(JAVA_PROJECT_PATH!, "target", requestedPath) // ✅ Fetch subfolders
    : path.join(JAVA_PROJECT_PATH!, "target"); // ✅ Fetch root artifacts

  console.log(`🔍 Fetching artifacts from: ${targetDir}`);

  if (!fs.existsSync(targetDir)) {
    console.warn(`⚠️ WARNING: No 'target/' directory found at: ${targetDir}`);
    return res.json({ warning: "Build artifacts not found." });
  }

  try {
    const entries = fs
      .readdirSync(targetDir, { withFileTypes: true })
      .map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        path: requestedPath
          ? `${requestedPath}/${entry.name}` // ✅ Construct proper relative path
          : entry.name, // ✅ Root level items remain as is
      }));

    console.log(`📂 Found ${entries.length} items in: ${targetDir}`);
    return res.json(entries);
  } catch (error) {
    console.error("❌ ERROR: Failed to read artifacts:", error);
    return res.status(500).json({ error: "Failed to read artifacts" });
  }
});

// ✅ API to Download Files
router.get("/download", (req: Request, res: Response): any => {
  console.log("🔍 Download request received");
  const { file } = req.query;

  if (!file || typeof file !== "string") {
    return res.status(400).json({ error: "Invalid file path" });
  }

  const JAVA_PROJECT_PATH = getJavaProjectPath();
  const targetDir = path.join(JAVA_PROJECT_PATH || "", "target");
  const filePath = path.join(targetDir, file); // ✅ Ensure file is inside `target/`

  console.log(`🔍 Download request for: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: File not found - ${filePath}`);
    return res.status(404).json({ error: "File not found" });
  }

  // ✅ Securely send file
  return res.download(filePath, file, (err) => {
    if (err) {
      console.error(`❌ ERROR: Failed to download file - ${filePath}`, err);
      return res.status(500).json({ error: "Failed to download file" });
    }
  });
});

// ✅ API to Set Repository Path
router.post("/set-repo-path", (req: Request, res: Response): any => {
  const { repoPath } = req.body;

  console.log(`🔍 Received repo path update request: ${repoPath}`);

  if (!repoPath || !fs.existsSync(repoPath)) {
    console.log(`❌ Invalid repo path: ${repoPath}`);
    return res.status(400).json({ error: "Invalid repository path" });
  }

  setJavaProjectPath(repoPath); // ✅ Dynamically update project path
  console.log(`✅ Updated Java project path: ${getJavaProjectPath()}`);

  // ✅ Save path for debugging
  fs.writeFileSync(
    "repoPath.log",
    `JAVA_PROJECT_PATH=${getJavaProjectPath()}\n`
  );

  return res
    .status(200)
    .json({ message: "Repository path updated successfully" });
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
      setJavaProjectPath(extractDir);

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

router.get("clone-repo", async (req, res): Promise<any> => {
  res.json({ message: "Clone Repo" });
});

router.post("/clone-repo", async (req, res): Promise<any> => {
  console.log("🔍 Received repository clone request");
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "Repository URL is required" });
  }

  try {
    const repoPath = cloneRepository(repoUrl);

    if (!repoPath) {
      return res
        .status(500)
        .json({ error: "Failed to determine cloned repo path" });
    }

    setJavaProjectPath(repoPath);
    return res.json({ success: true, repoPath });
  } catch (error) {
    console.error("❌ Error cloning repository:", error);
    return res.status(500).json({ error: "Failed to clone repository" });
  }
});

export default router;
