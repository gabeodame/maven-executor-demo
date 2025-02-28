import { Server } from "socket.io";
import { runMavenCommand } from "../services/mavenService";

export const setupSocketRoutes = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("✅ Client connected");

    socket.on("run-maven-command", (command: string) => {
      runMavenCommand(io, socket, command);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });
  });
};
