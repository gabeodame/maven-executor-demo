import { spawn } from "child_process";
import {
  MAVEN_PATH,
  JAVA_PROJECT_PATH as DEFAULT_PROJECT_PATH,
} from "../config/paths";
import { Server } from "socket.io";
import fs from "fs";

let JAVA_PROJECT_PATH = DEFAULT_PROJECT_PATH; // ✅ Default to demo-java-app

// ✅ API Endpoint to Dynamically Update Java Project Path
export const setRepoPath = (req: any, res: any) => {
  const { repoPath } = req.body;

  console.log(`🔍 Received repo path update request: ${repoPath}`);

  if (!repoPath || !fs.existsSync(repoPath)) {
    console.log(`❌ Invalid repo path: ${repoPath}`);
    return res.status(400).json({ error: "Invalid repository path" });
  }

  JAVA_PROJECT_PATH = repoPath; // ✅ Update the global Java project path
  console.log(`✅ Updated Java project path: ${JAVA_PROJECT_PATH}`);

  return res
    .status(200)
    .json({ message: "Repository path updated successfully" });
};

// ✅ Ensure runMavenCommand() uses the updated JAVA_PROJECT_PATH
export const runMavenCommand = (io: Server, socket: any, command: string) => {
  console.log(`▶️ Executing Maven in: ${JAVA_PROJECT_PATH}`);
  console.log(`▶️ Running: ${MAVEN_PATH} ${command} -B -ntp`);

  if (!fs.existsSync(JAVA_PROJECT_PATH)) {
    console.log(
      `❌ ERROR: Java project path does not exist: ${JAVA_PROJECT_PATH}`
    );
    socket.emit(
      "maven-output",
      `❌ ERROR: Java project path does not exist: ${JAVA_PROJECT_PATH}`
    );
    return;
  }

  if (!fs.existsSync(`${JAVA_PROJECT_PATH}/pom.xml`)) {
    console.log(`❌ ERROR: No pom.xml found in ${JAVA_PROJECT_PATH}`);
    socket.emit(
      "maven-output",
      `❌ ERROR: No pom.xml found in ${JAVA_PROJECT_PATH}`
    );
    return;
  }

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
  });
};
