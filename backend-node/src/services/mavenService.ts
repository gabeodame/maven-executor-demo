import { spawn } from "child_process";
import {
  MAVEN_PATH,
  JAVA_PROJECT_PATH as DEFAULT_PROJECT_PATH,
} from "../config/paths";
import { Server } from "socket.io";
import fs from "fs";
import { getJavaProjectPath } from "../config/projectPaths";

// ✅ Ensure runMavenCommand() uses the updated JAVA_PROJECT_PATH
export const runMavenCommand = (io: Server, socket: any, command: string) => {
  const JAVA_PROJECT_PATH = getJavaProjectPath();
  console.log(`▶️ Executing Maven in: ${JAVA_PROJECT_PATH}`);

  if (!fs.existsSync(JAVA_PROJECT_PATH)) {
    console.error(
      `❌ ERROR: Java project path does not exist: ${JAVA_PROJECT_PATH}`
    );
    socket.emit(
      "maven-output",
      `❌ ERROR: Java project path does not exist: ${JAVA_PROJECT_PATH}`
    );
    return;
  }

  if (!fs.existsSync(`${JAVA_PROJECT_PATH}/pom.xml`)) {
    console.error(`❌ ERROR: No pom.xml found in ${JAVA_PROJECT_PATH}`);
    socket.emit(
      "maven-output",
      `❌ ERROR: No pom.xml found in ${JAVA_PROJECT_PATH}`
    );
    return;
  }

  console.log(`▶️ Running: mvn ${command} in ${JAVA_PROJECT_PATH}`);

  const childProcess = spawn(MAVEN_PATH, [command, "-B", "-ntp"], {
    cwd: JAVA_PROJECT_PATH,
    env: { ...process.env, PATH: process.env.PATH || "" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  childProcess.stdout.on("data", (data: Buffer) => {
    const message = data.toString();
    console.log(`📡 [STDOUT]: ${message}`);
    socket.emit("maven-output", message);
  });

  childProcess.stderr.on("data", (data: Buffer) => {
    const errorMessage = data.toString();
    console.error(`❌ [STDERR]: ${errorMessage}`);
    socket.emit("maven-output", `❌ ERROR: ${errorMessage}`);
  });

  childProcess.on("close", (code) => {
    console.log(`✅ Maven process exited with code: ${code}`);
    socket.emit("maven-output", `✅ Process exited with code ${code}`);

    // ✅ Only check artifacts after build completes
    setTimeout(() => {
      console.log(`🔍 Checking for artifacts in: ${JAVA_PROJECT_PATH}/target`);
      if (fs.existsSync(`${JAVA_PROJECT_PATH}/target`)) {
        console.log(
          `✅ Artifacts directory found: ${JAVA_PROJECT_PATH}/target`
        );
      } else {
        console.warn(`⚠️ No artifacts found at: ${JAVA_PROJECT_PATH}/target`);
      }
    }, 2000); // ✅ Give some time for the build to finalize
  });
};
