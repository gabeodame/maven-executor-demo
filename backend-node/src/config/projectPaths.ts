import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const SESSION_WORKSPACE_DIR = "/app/workspaces"; // ✅ Centralized workspace storage
export const DEFAULT_PROJECT_NAME = "demo-java-app"; // ✅ Default fallback project
export const DEFAULT_PROJECT_SOURCE = "/app/demo-java-app";

// ✅ Function to get the Java Project Path for a specific session
export const getJavaProjectPath = (sessionId: string): string => {
  if (!sessionId) {
    console.error("❌ ERROR: Session ID is required to get Java Project Path.");
    return "";
  }

  const sessionWorkspace = path.join(SESSION_WORKSPACE_DIR, sessionId);
  const projectPathFile = path.join(sessionWorkspace, "java_project_path.txt");

  // ✅ Return stored project path if available
  if (fs.existsSync(projectPathFile)) {
    return fs.readFileSync(projectPathFile, "utf-8").trim();
  }

  // ✅ Otherwise, fall back to default project
  return path.join(sessionWorkspace, DEFAULT_PROJECT_NAME);
};

// ✅ Function to set a new Java Project Path for a session
export const setJavaProjectPath = (
  sessionId: string,
  newPath: string
): void => {
  if (!sessionId) {
    console.error("❌ ERROR: Session ID is required to set Java Project Path.");
    return;
  }

  if (!fs.existsSync(newPath)) {
    console.error(`❌ ERROR: Path does not exist: ${newPath}`);
    return;
  }

  const sessionWorkspace = path.join(SESSION_WORKSPACE_DIR, sessionId);

  // ✅ Ensure session workspace exists
  if (!fs.existsSync(sessionWorkspace)) {
    fs.mkdirSync(sessionWorkspace, { recursive: true });
  }

  // ✅ Store session-based Java project path
  fs.writeFileSync(
    path.join(sessionWorkspace, "java_project_path.txt"),
    newPath
  );
  console.log(
    `✅ Java project path updated for session ${sessionId}: ${newPath}`
  );
};

// ✅ Function to initialize a session-based project workspace
export const initializeSessionWorkspace = (sessionId: string): string => {
  if (!sessionId) {
    console.error("❌ ERROR: Session ID is required to initialize workspace.");
    return "";
  }

  const sessionWorkspace = path.join(SESSION_WORKSPACE_DIR, sessionId);
  const defaultProjectPath = path.join(sessionWorkspace, DEFAULT_PROJECT_NAME);

  // ✅ Ensure session workspace exists
  if (!fs.existsSync(sessionWorkspace)) {
    fs.mkdirSync(sessionWorkspace, { recursive: true });
    console.log(`✅ Created workspace for session: ${sessionId}`);
  }

  // ✅ Ensure default project is available
  if (!fs.existsSync(defaultProjectPath)) {
    console.log(`🚀 Setting up default project for session: ${sessionId}`);

    // ✅ Copy template project if available
    if (fs.existsSync(DEFAULT_PROJECT_SOURCE)) {
      execSync(`cp -r ${DEFAULT_PROJECT_SOURCE} ${defaultProjectPath}`, {
        stdio: "inherit",
      });
      console.log(`✅ Copied default project to: ${defaultProjectPath}`);
    } else {
      console.error(
        `❌ ERROR: Default project source (${DEFAULT_PROJECT_SOURCE}) is missing!`
      );
    }

    // ✅ Persist the default project path
    setJavaProjectPath(sessionId, defaultProjectPath);
  }

  return sessionWorkspace;
};
// ✅ Function to setup the default Java project
export const setupDefaultProject = (sessionId: string): string => {
  const sessionWorkspace = initializeSessionWorkspace(sessionId);
  const defaultProjectPath = path.join(sessionWorkspace, DEFAULT_PROJECT_NAME);
  const templatePath = "/app/templates/demo-java-app"; // ✅ Ensure this exists

  if (!fs.existsSync(defaultProjectPath)) {
    console.log(`🚀 Setting up default demo project for session: ${sessionId}`);
    fs.mkdirSync(defaultProjectPath, { recursive: true });

    if (fs.existsSync(templatePath)) {
      execSync(`cp -r ${templatePath}/* ${defaultProjectPath}`, {
        stdio: "inherit",
      });
      console.log(`✅ Default project copied to: ${defaultProjectPath}`);
    } else {
      console.warn(`⚠️ Template project missing at ${templatePath}.`);
    }

    // ✅ Persist the default project path
    setJavaProjectPath(sessionId, defaultProjectPath);
  }

  return defaultProjectPath;
};
