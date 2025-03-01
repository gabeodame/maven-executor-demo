import { Server } from "socket.io";
import { runMavenCommand } from "../services/mavenService";
import { getJavaProjectPath } from "../config/projectPaths";

export const setupSocketRoutes = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("✅ Client connected");

    socket.on("run-maven-command", (command: string) => {
      console.log(`📁 Using repo path: ${getJavaProjectPath()}`);
      runMavenCommand(io, socket, command);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });
  });
};
