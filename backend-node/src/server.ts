import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { spawn } from "child_process";
import path from "path";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5001; // Default to port 5001

// ✅ Set the correct path for Maven
const MAVEN_PATH = "/usr/local/bin/mvn"; // Ensure this matches `which mvn`
const JAVA_PROJECT_PATH = path.resolve(__dirname, "../../demo-java-app");

// ✅ Debug: Log paths for verification
console.log(`Using Java Project Path: ${JAVA_PROJECT_PATH}`);
console.log(`Using Maven Path: ${MAVEN_PATH}`);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ✅ Enable CORS for frontend communication
app.use(cors({ origin: "http://localhost:5173" }));

io.on("connection", (socket) => {
  console.log("Client connected");

  // ✅ Run Maven commands dynamically when received from frontend
  socket.on("run-maven-command", (command: string) => {
    console.log(`Executing: ${MAVEN_PATH} ${command} in ${JAVA_PROJECT_PATH}`);

    // ✅ Fix: Rename `process` to `childProcess` to avoid conflict with the global Node.js `process`
    const childProcess = spawn(MAVEN_PATH, [command], {
      cwd: JAVA_PROJECT_PATH,
      env: { ...process.env, PATH: "/usr/local/bin:" + process.env.PATH }, // Ensure correct PATH
    });

    childProcess.stdout.on("data", (data: Buffer) => {
      socket.emit("maven-output", data.toString());
    });

    childProcess.stderr.on("data", (data: Buffer) => {
      socket.emit("maven-output", `ERROR: ${data.toString()}`);
    });

    childProcess.on("close", (code) => {
      socket.emit("maven-output", `Process exited with code ${code}`);
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ✅ Start the backend server

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
