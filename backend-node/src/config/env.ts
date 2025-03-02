import dotenv from "dotenv";
import path from "path";
import { execSync } from "child_process";
import fs from "fs";

dotenv.config();

const getValidatedMavenPath = () => {
  try {
    const resolvedPath = execSync(
      `realpath ${process.env.MAVEN_PATH || "/usr/bin/mvn"}`
    )
      .toString()
      .trim();
    if (!fs.existsSync(resolvedPath)) {
      throw new Error("Maven not found");
    }
    return resolvedPath;
  } catch (err) {
    console.error(
      `❌ ERROR: Maven not found at "${
        process.env.MAVEN_PATH || "/usr/bin/mvn"
      }".`
    );
    process.exit(1);
  }
};

export const config = {
  PORT: Number(process.env.PORT) || 5001,
  MAVEN_PATH: getValidatedMavenPath(),

  // ✅ Generic setup based on NODE_ENV
  JAVA_PROJECT_PATH: process.env.JAVA_PROJECT_PATH || "/app/demo-java-app",

  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
};

console.log(`✅ Configured Java Project Path: ${config.JAVA_PROJECT_PATH}`);
console.log(`✅ Configured Maven Path: ${config.MAVEN_PATH}`);
