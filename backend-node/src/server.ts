import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import serverRoutes from "./routes/serverRoutes";
import { runMavenCommand } from "./services/mavenService";
import { config } from "./config/env";
import { cleanupInactiveWorkspaces } from "./services/cleanInactiveWorkspaces";

const app = express();
const server = http.createServer(app);

const allowedOrigins = config.ALLOWED_ORIGINS || [
  "http://localhost:3000",
  "https://maven-executor-demo.vercel.app",
];

// ✅ Apply consistent CORS for both Express and Socket.io
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS Blocked Origin: ${origin}`);
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "x-session-id", // ✅ Allow session ID header
  ],
};

// ✅ Use same CORS settings for Express and WebSockets
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Proper preflight handling

app.use(express.json());

// ✅ Register API Routes
app.use("/api", serverRoutes);

// ✅ Run cleanup process
cleanupInactiveWorkspaces();

// ✅ Setup WebSocket Server with Correct CORS
const io = new Server(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  console.log("✅ WebSocket Client connected");

  socket.on("run-maven", (command) => {
    console.log(`🚀 Running Maven Command: ${command}`);
    runMavenCommand(io, socket, command);
  });

  socket.on("disconnect", () => {
    console.log("❌ WebSocket Client disconnected");
  });
});

// ✅ Start Server
server.listen(config.PORT, () => {
  console.log(`✅ Backend Server running on port ${config.PORT}`);
});
