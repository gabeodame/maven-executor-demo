import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { execSync, spawn } from "child_process";
import path from "path";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

// ✅ Fly.io runs apps on port 8080, use it explicitly
const PORT = Number(process.env.PORT) || 5001;

// ✅ Check if Maven is installed
let MAVEN_PATH = process.env.MAVEN_PATH || "/usr/local/bin/mvn";
try {
  MAVEN_PATH = execSync(`realpath ${MAVEN_PATH}`).toString().trim();
  if (!fs.existsSync(MAVEN_PATH)) {
    throw new Error("Maven not found");
  }
} catch (err) {
  console.error(`❌ ERROR: Maven not found at "${MAVEN_PATH}".`);
  process.exit(1);
}

console.log(`✅ Using Maven Path: ${MAVEN_PATH}`);

// ✅ Determine Java project path based on environment
const isFlyIo = process.env.FLY_APP_NAME !== undefined; // Check if running on Fly.io

const JAVA_PROJECT_PATH = isFlyIo
  ? "/app/demo-java-app" // ✅ Remote (Fly.io)
  : path.resolve(__dirname, "../../demo-java-app"); // ✅ Local

console.log(`✅ Using Java Project Path: ${JAVA_PROJECT_PATH}`);

// ✅ Debug: Log paths for verification
console.log(`✅ Using Java Project Path: ${JAVA_PROJECT_PATH}`);
console.log(`✅ Using Maven Path: ${MAVEN_PATH}`);

const defaultOrigins = [
  "http://localhost:5173", // Local frontend
  "http://127.0.0.1:5173", // Alternative local frontend
];

const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : []),
];

console.log("✅ Allowed Origins:", allowedOrigins);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Enable CORS for frontend communication
app.use(cors({ origin: allowedOrigins }));

io.on("connection", (socket) => {
  console.log("✅ Client connected");

  socket.on("run-maven-command", (command: string) => {
    console.log(
      `▶️ Executing: ${MAVEN_PATH} ${command} in ${JAVA_PROJECT_PATH}`
    );

    if (!fs.existsSync(JAVA_PROJECT_PATH)) {
      socket.emit(
        "maven-output",
        "❌ ERROR: Java project path does not exist."
      );
      return;
    }

    const childProcess = spawn(MAVEN_PATH, [command], {
      cwd: JAVA_PROJECT_PATH,
      env: {
        ...process.env,
        PATH: process.env.PATH || "",
      },
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
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// ✅ Ensure the server listens on 0.0.0.0 for Fly.io
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
