import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import serverRoutes from "./routes/serverRoutes";
import { runMavenCommand } from "./services/mavenService";
import { config } from "./config/env";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(
  cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true, // ✅ Allows cookies & auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  })
);
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
  console.log(`✅ Backend Server running on port ${config.PORT}`);
});
