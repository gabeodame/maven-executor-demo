import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { runMavenCommand, setRepoPath } from "./services/mavenService";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// ✅ Register API to Update Java Project Path
app.post("/api/set-repo-path", setRepoPath);

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
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`✅ Backend Server running on port ${PORT}`);
});
