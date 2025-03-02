import { getJavaProjectPath } from "./projectPaths";
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

// ✅ Always get the latest project path dynamically
const JAVA_PROJECT_PATH = getJavaProjectPath() || "";

// ✅ Ensure the path exists
if (!fs.existsSync(path.join(JAVA_PROJECT_PATH, "pom.xml"))) {
  logger.error(
    `❌ ERROR: Java project path "${JAVA_PROJECT_PATH}" does not contain a pom.xml.`
  );
  process.exit(1);
}

logger.info(`✅ Maven Path: ${MAVEN_PATH}`);
logger.info(`✅ Java Project Path: ${JAVA_PROJECT_PATH}`);

export { MAVEN_PATH, JAVA_PROJECT_PATH };
