import { spawn } from "child_process";
import { MAVEN_PATH } from "../config/paths";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { getJavaProjectPath } from "../config/projectPaths";

let lastBuildMetrics: Record<string, string | number | null> = {
  status: "Unknown",
  totalTime: null,
  testsPassed: null,
  testsFailed: null,
  errors: null,
  warnings: null,
};

export const runMavenCommand = (io: Server, socket: any, command: string) => {
  const JAVA_PROJECT_PATH = getJavaProjectPath();
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, ""); // Create a unique build ID
  const buildDir = path.join(JAVA_PROJECT_PATH, "target", `build-${timestamp}`);

  console.log(`▶️ Executing Maven in: ${JAVA_PROJECT_PATH}`);
  console.log(`▶️ Running: mvn ${command} -B -ntp`);

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

  // Ensure build folder exists
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  const childProcess = spawn("mvn", [command, "-B", "-ntp"], {
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

    // Move generated artifacts into build-{timestamp} directory
    const targetDir = path.join(JAVA_PROJECT_PATH, "target");
    if (fs.existsSync(targetDir)) {
      fs.readdirSync(targetDir).forEach((file) => {
        if (!file.startsWith("build-")) {
          fs.renameSync(path.join(targetDir, file), path.join(buildDir, file));
        }
      });
    }
  });
};

// ✅ Extract important build metrics from logs
const extractBuildMetrics = (log: string, exitCode: number) => {
  const totalTimeMatch = log.match(/\[INFO\] Total time: ([\d\.]+) s/);
  const totalTime = totalTimeMatch ? totalTimeMatch[1] : "0.0"; // Fix "Unknown" issue

  const metrics = {
    status: exitCode === 0 ? "Success" : "Failed",
    totalTime: totalTime, // ✅ Now correctly extracted
    testsPassed:
      log.match(/Tests run: (\d+), Failures: 0, Errors: 0/)?.[1] || "0",
    testsFailed: log.match(/Failures: (\d+)/)?.[1] || "0",
    errors: log.match(/Errors: (\d+)/)?.[1] || "0",
    warnings: log.split("WARNING").length - 1, // ✅ Count warning messages
  };

  console.log("📊 Extracted Build Metrics:", metrics); // ✅ Debug output
  return metrics;
};

// ✅ API Endpoint to Fetch Last Build Metrics
export const getBuildMetrics = (req: any, res: any) => {
  res.json(lastBuildMetrics);
};
