import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { getJavaProjectPath, setJavaProjectPath } from "../config/projectPaths";

const router = express.Router();
const JAVA_PROJECT_PATH = getJavaProjectPath();

// ✅ API to List Artifacts in `target/`
router.get("/artifacts", (req: Request, res: Response): any => {
  const JAVA_PROJECT_PATH = getJavaProjectPath();
  const targetDir = req.query.path
    ? path.join(JAVA_PROJECT_PATH, "target", req.query.path as string)
    : path.join(JAVA_PROJECT_PATH, "target");

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
        path: path.join((req.query.path as string) || "", entry.name), // Preserve relative path
      }));

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
  const targetDir = path.join(JAVA_PROJECT_PATH, "target");
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

  return res
    .status(200)
    .json({ message: "Repository path updated successfully" });
});

export default router;
