import path from "path";
import { execSync } from "child_process";
import fs from "fs";
import { config } from "./env";
import { logger } from "../utils/logger";

// ✅ Validate Maven Path
let MAVEN_PATH = config.MAVEN_PATH;
try {
  MAVEN_PATH = execSync(`realpath ${MAVEN_PATH}`).toString().trim();
  if (!fs.existsSync(MAVEN_PATH)) {
    throw new Error("Maven not found");
  }
} catch (err) {
  logger.error(`❌ ERROR: Maven not found at "${MAVEN_PATH}".`);
  process.exit(1);
}

// ✅ Ensure the correct Java Project Path
const JAVA_PROJECT_PATH =
  process.env.NODE_ENV === "production"
    ? "/app/demo-java-app" // ✅ Path inside container
    : path.resolve(__dirname, "../../../demo-java-app"); // ✅ Correct Local Path

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
