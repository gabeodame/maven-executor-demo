import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import serverRoutes from "./routes/serverRoutes";
import { runMavenCommand } from "./services/mavenService";
import { config } from "./config/env";
import { cleanupInactiveWorkspaces } from "./services/cleanInactiveWorkspaces";
import { setupSocketRoutes } from "./routes/socketRoutes"; // ✅ Ensure WebSocket routes are included

const app = express();
const server = http.createServer(app);

const allowedOrigins = config.ALLOWED_ORIGINS || [
  "http://localhost:3000",
  "https://maven-executor-demo.vercel.app",
];

// ✅ Apply consistent CORS for both Express and WebSockets
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

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// ✅ Register API Routes
app.use("/api", serverRoutes);

// ✅ Run cleanup process
cleanupInactiveWorkspaces();

// ✅ Setup WebSocket Server with Correct CORS
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"], // ✅ Ensure WebSocket & polling fallback
  path: "/socket.io/", // ✅ Ensure WebSocket path matches frontend
});

// ✅ Attach WebSocket routes
setupSocketRoutes(io);

server.listen(config.PORT, () => {
  console.log(`✅ Backend Server running on port ${config.PORT}`);
});
