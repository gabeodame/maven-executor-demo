import fs from "fs";
import path from "path";

declare global {
  var JAVA_PROJECT_PATH: string | undefined;
}

// ✅ Ensure global scope for persistence
if (!globalThis.JAVA_PROJECT_PATH) {
  globalThis.JAVA_PROJECT_PATH =
    process.env.JAVA_PROJECT_PATH || "/app/demo-java-app";
}

// ✅ Function to get the Java Project Path
export const getJavaProjectPath = () => globalThis.JAVA_PROJECT_PATH;

// ✅ Function to set a new Java Project Path
export const setJavaProjectPath = (newPath: string) => {
  if (!fs.existsSync(newPath)) {
    console.error(`❌ ERROR: Path does not exist: ${newPath}`);
    return;
  }
  globalThis.JAVA_PROJECT_PATH = newPath;
  console.log(`✅ Java project path updated to: ${newPath}`);
};
