import { spawn } from "child_process";
import { Server, Socket } from "socket.io";
import fs from "fs";
import path from "path";
import { getJavaProjectPath } from "../config/projectPaths";

let lastBuildMetrics = {
  status: "Unknown",
  totalTime: null as string | null,
  testsPassed: null as string | null,
  testsFailed: null as string | null,
  errors: null as string | null,
  warnings: 0,
};

// ✅ Extract Important Build Metrics from Logs
const extractBuildMetrics = (log: string, exitCode: number) => {
  const totalTimeMatch = log.match(/\[INFO\] Total time: ([\d\.]+) s/);
  const totalTime = totalTimeMatch ? totalTimeMatch[1] : null;

  const testsPassedMatch = log.match(
    /Tests run: (\d+),\s*Failures: 0,\s*Errors: 0/
  );
  const testsPassed = testsPassedMatch ? testsPassedMatch[1] : "0";

  const testsFailedMatch = log.match(/Failures:\s*(\d+)/);
  const testsFailed = testsFailedMatch ? testsFailedMatch[1] : "0";

  const errorsMatch = log.match(/Errors:\s*(\d+)/);
  const errors = errorsMatch ? errorsMatch[1] : "0";

  const warningsCount = (log.match(/\[WARNING\]/g) || []).length; // ✅ Proper warning count

  lastBuildMetrics = {
    status: exitCode === 0 ? "Success" : "Failed",
    totalTime,
    testsPassed,
    testsFailed,
    errors,
    warnings: warningsCount,
  };

  console.log("📊 Updated Build Metrics:", lastBuildMetrics);
};

// ✅ Run Maven Command and Capture Logs
export const runMavenCommand = (
  io: Server,
  socket: Socket,
  command: string
) => {
  const JAVA_PROJECT_PATH = getJavaProjectPath();
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, ""); // Unique build ID
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

  // ✅ Ensure build directory exists
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  let fullLog = "";

  const childProcess = spawn("mvn", [command, "-B", "-ntp"], {
    cwd: JAVA_PROJECT_PATH,
    env: { ...process.env, PATH: process.env.PATH || "" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  childProcess.stdout.on("data", (data: Buffer) => {
    const message = data.toString();
    fullLog += message;
    console.log(`📡 [STDOUT]: ${message}`);
    socket.emit("maven-output", message);
  });

  childProcess.stderr.on("data", (data: Buffer) => {
    const errorMessage = data.toString();
    fullLog += errorMessage;
    console.error(`❌ [STDERR]: ${errorMessage}`);
    socket.emit("maven-output", `❌ ERROR: ${errorMessage}`);
  });

  childProcess.on("close", (code) => {
    console.log(`✅ Maven process exited with code: ${code}`);
    socket.emit("maven-output", `✅ Process exited with code ${code}`);

    // ✅ Extract Build Metrics
    extractBuildMetrics(fullLog, code || 1);
    io.emit("build-metrics-updated", lastBuildMetrics); // ✅ Notify all clients

    // ✅ Move generated artifacts into `build-{timestamp}` directory
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

// ✅ API Endpoint to Fetch Last Build Metrics
export const getBuildMetrics = (req: any, res: any) => {
  console.log("📊 Serving Last Build Metrics:", lastBuildMetrics);
  res.json(lastBuildMetrics);
};
