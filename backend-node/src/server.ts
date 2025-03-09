import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "./config/env";
import { cleanupInactiveWorkspaces } from "./services/cleanInactiveWorkspaces";
import { setupSocketRoutes } from "./routes/socketRoutes";
import { setupServerRoutes } from "./routes/serverRoutes"; // ✅ Correct import

const app = express();
const server = http.createServer(app);

const allowedOrigins = config.ALLOWED_ORIGINS || [
  "http://localhost:3000",
  "https://maven-executor-demo.vercel.app",
];

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
    "x-session-id",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// ✅ Correctly Register API Routes
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  path: "/socket.io/",
});

setupServerRoutes(app, io); // ✅ FIX: Ensuring routes are registered

// ✅ Cleanup Process
cleanupInactiveWorkspaces();

// ✅ Attach WebSocket routes
setupSocketRoutes(io);

server.listen(config.PORT, () => {
  console.log(`✅ Backend Server running on port ${config.PORT}`);
});
