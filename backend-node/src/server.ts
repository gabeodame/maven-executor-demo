import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import serverRoutes from "./routes/serverRoutes";
import { runMavenCommand } from "./services/mavenService";
import { config } from "./config/env";
import { JAVA_PROJECT_PATH } from "./config/paths";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.ALLOWED_ORIGINS, // ✅ Apply dynamic CORS origin handling
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : ["http://localhost:3000", "https://maven-executor-demo.vercel.app"];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  })
);

// Ensure CORS headers in preflight requests
app.options("*", cors());
app.use(express.json());

// ✅ Register API Routes
app.use("/api", serverRoutes);

// ✅ WebSocket Handling
io.on("connection", (socket) => {
  console.log("✅ Client connected");

  socket.on("run-maven", (command) => {
    console.log(`🚀 Received command from client: ${command}`);
    runMavenCommand(io, socket, command);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// ✅ Start Server
server.listen(config.PORT, () => {
  console.log(JAVA_PROJECT_PATH);
  console.log(`✅ Backend Server running on port ${config.PORT}`);
});
