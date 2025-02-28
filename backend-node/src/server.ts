import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { config } from "./config/env";
import { setupSocketRoutes } from "./routes/socketRoutes";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

// ✅ Enable CORS
app.use(cors({ origin: config.ALLOWED_ORIGINS }));

// ✅ Setup WebSockets
setupSocketRoutes(io);

// ✅ Start Server
server.listen(config.PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${config.PORT}`);
});
