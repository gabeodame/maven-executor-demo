import { spawn } from "child_process";
import { MAVEN_PATH, JAVA_PROJECT_PATH } from "../config/paths";
import { Server } from "socket.io";
import fs from "fs";

export const runMavenCommand = (io: Server, socket: any, command: string) => {
  console.log(`▶️ Executing Maven in: ${JAVA_PROJECT_PATH}`);
  console.log(`▶️ Running: ${MAVEN_PATH} ${command}`);

  if (!fs.existsSync(JAVA_PROJECT_PATH)) {
    socket.emit(
      "maven-output",
      `❌ ERROR: Java project path does not exist: ${JAVA_PROJECT_PATH}`
    );
    return;
  }

  if (!fs.existsSync(`${JAVA_PROJECT_PATH}/pom.xml`)) {
    socket.emit(
      "maven-output",
      `❌ ERROR: No pom.xml found in ${JAVA_PROJECT_PATH}`
    );
    return;
  }

  const childProcess = spawn(MAVEN_PATH, [command], {
    cwd: JAVA_PROJECT_PATH, // Set the current working directory
    env: { ...process.env, PATH: process.env.PATH || "" },
  });

  childProcess.stdout.on("data", (data: Buffer) => {
    socket.emit("maven-output", data.toString());
  });

  childProcess.stderr.on("data", (data: Buffer) => {
    socket.emit("maven-output", `❌ ERROR: ${data.toString()}`);
  });

  childProcess.on("close", (code) => {
    socket.emit("maven-output", `✅ Process exited with code ${code}`);
  });
};
