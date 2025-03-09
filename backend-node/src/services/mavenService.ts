import { execSync, spawn } from "child_process";
import { Server, Socket } from "socket.io";
import fs from "fs";
import path from "path";
import {
  getJavaProjectPath,
  initializeSessionWorkspace,
  setupDefaultProject,
} from "../config/projectPaths";
import { extractBuildMetrics, getLastBuildMetrics } from "./metricsService";

// ✅ Store build metrics per session
const lastBuildMetrics: Record<string, any> = {};

/**
 * ✅ Run Maven Command and Capture Logs
 */
export const runMavenCommand = (
  io: Server,
  socket: Socket,
  command: string
) => {
  console.log(`▶️ Running Maven Command: ${command}`);
  const sessionId = socket.handshake.auth?.sessionId;

  if (!sessionId) {
    console.log("❌ ERROR: No session ID provided!");
    socket.emit("maven-output", "❌ ERROR: No session ID provided!");
    return;
  }

  // ✅ Ensure session workspace exists
  initializeSessionWorkspace(sessionId);

  let projectPath = getJavaProjectPath(sessionId);

  if (!fs.existsSync(path.join(projectPath, "pom.xml"))) {
    console.log(`⚠️ No valid project found, using default.`);
    projectPath = setupDefaultProject(sessionId); // ✅ Automatically setup default
  }

  console.log(`▶️ Running Maven in: ${projectPath}`);

  let fullLog = "";

  const childProcess = spawn("mvn", [command, "-B", "-ntp"], {
    cwd: projectPath,
    env: { ...process.env, PATH: process.env.PATH || "" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  childProcess.stdout.on("data", (data: Buffer) => {
    const message = data.toString();
    fullLog += message;
    socket.emit("maven-output", message);
  });

  childProcess.stderr.on("data", (data: Buffer) => {
    const errorMessage = data.toString();
    fullLog += errorMessage;
    socket.emit("maven-output", `❌ ERROR: ${errorMessage}`);
  });

  childProcess.on("close", (code) => {
    socket.emit("maven-output", `✅ Process exited with code ${code}`);

    // ✅ Store extracted build metrics per session
    const buildMetrics = extractBuildMetrics(fullLog, code || 1, sessionId);
    io.to(sessionId).emit("build-metrics-updated", buildMetrics);

    // ✅ Store it in `lastBuildMetrics` for future API access
    lastBuildMetrics[sessionId] = buildMetrics;

    console.log(
      `📊 Updated Build Metrics for session ${sessionId}:`,
      buildMetrics
    );
  });
};

/**
 * ✅ API to Fetch Last Build Metrics for a Session
 */
export const getBuildMetrics = (req: any, res: any) => {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId || !lastBuildMetrics[sessionId]) {
    return res.json({ error: "No build metrics found for session." });
  }
  res.json(lastBuildMetrics[sessionId]);
};

export const getMavenVersion = (req: any, res: any) => {
  console.log("🔍 Fetching Maven Version");
  try {
    const mvnVersionOutput = execSync("mvn -version", {
      encoding: "utf-8",
    }).split("\n")[0];

    // Extract only the version number (e.g., "3.9.9")
    const match = mvnVersionOutput.match(/Apache Maven (\d+\.\d+\.\d+)/);
    const cleanVersion = match ? `Maven ${match[1]}` : "Maven: Unknown";

    console.log(`🛠 Maven Version: ${cleanVersion}`);

    res.json({ version: cleanVersion });
  } catch (error) {
    res.json({ version: "Maven: Unknown" });
  }
};
