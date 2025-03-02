import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const BASE_DIR = "/app/repositories"; // Store cloned repos

export const cloneRepository = (repoUrl: string) => {
  const repoName = path.basename(repoUrl, ".git");
  const repoPath = path.join(BASE_DIR, repoName);

  if (fs.existsSync(repoPath)) {
    console.log(`✅ Repository already exists: ${repoPath}`);
    return repoPath;
  }

  console.log(`🚀 Cloning ${repoUrl} into ${repoPath}...`);
  execSync(`git clone --depth=1 ${repoUrl} ${repoPath}`, { stdio: "inherit" });

  console.log(`✅ Repository cloned successfully: ${repoPath}`);
  return repoPath;
};
