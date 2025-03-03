import { getJavaProjectPath, initializeSessionWorkspace } from "./projectPaths";
import { execSync } from "child_process";
import fs from "fs";
import { logger } from "../utils/logger";
import path from "path";

// ✅ Validate Maven Path
let MAVEN_PATH = process.env.MAVEN_PATH || "/usr/bin/mvn";
try {
  MAVEN_PATH = execSync(`realpath ${MAVEN_PATH}`).toString().trim();
  if (!fs.existsSync(MAVEN_PATH)) {
    throw new Error("Maven not found");
  }
} catch (err) {
  logger.error(`❌ ERROR: Maven not found at "${MAVEN_PATH}".`);
  process.exit(1);
}

/**
 * ✅ Retrieves the correct project path based on session.
 * Defaults to `/tmp/guest-session` if no session is provided.
 */
const getSessionProjectPath = (sessionId: string | undefined): string => {
  if (!sessionId) {
    logger.warn("⚠️ No session ID provided. Using guest workspace.");
    sessionId = "guest-session"; // ✅ Default guest workspace
  }

  // ✅ Ensure session workspace exists
  initializeSessionWorkspace(sessionId);

  // ✅ Get the Java project path for this session
  const JAVA_PROJECT_PATH = getJavaProjectPath(sessionId);

  if (!fs.existsSync(path.join(JAVA_PROJECT_PATH, "pom.xml"))) {
    logger.error(
      `❌ ERROR: Java project path "${JAVA_PROJECT_PATH}" does not contain a pom.xml.`
    );
    process.exit(1);
  }

  return JAVA_PROJECT_PATH;
};

// ✅ Export the session-based project path resolver
export { MAVEN_PATH, getSessionProjectPath };
