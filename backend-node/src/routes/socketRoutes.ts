import { Server, Socket } from "socket.io";
import { runMavenCommand } from "../services/mavenService";
import {
  initializeSessionWorkspace,
  getJavaProjectPath,
} from "../config/projectPaths";
import { cloneRepository } from "../services/cloneRepository";
import { IncomingMessage } from "http";

export const setupSocketRoutes = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    let sessionId = socket.handshake.auth?.sessionId;

    if (!sessionId) {
      console.log("⚠️ No session ID in handshake, checking request headers...");
      sessionId = extractSessionIdFromRequest(socket.request);
    }

    if (!sessionId) {
      console.log("❌ ERROR: No session ID provided!");
      socket.emit("maven-output", "❌ ERROR: No session ID provided!");
      socket.disconnect();
      return;
    }

    console.log(`✅ WebSocket Client connected [SESSION: ${sessionId}]`);
    initializeSessionWorkspace(sessionId);

    // ✅ Handle Maven Commands
    socket.on("run-maven-command", (command: string) => {
      const javaProjectPath = getJavaProjectPath(sessionId);
      if (!javaProjectPath) {
        console.log(`❌ ERROR: No Java project path for session ${sessionId}`);
        socket.emit("maven-output", "❌ ERROR: No Java project path found");
        return;
      }
      console.log(`📁 Running Maven in: ${javaProjectPath}`);
      runMavenCommand(io, socket, command);
    });

    // ✅ Handle Repository Cloning
    socket.on("clone-repo", async (data) => {
      const { repoUrl, branch, projectName, repoPath, pomPath } = data;
      console.log(
        `📢 [Backend] Received clone request for ${repoUrl} on branch ${branch}`
      );

      try {
        socket.emit(
          "clone-log",
          `🚀 Cloning repository: ${repoUrl} (branch: ${branch})`
        );

        // ✅ Pass io and socket correctly
        const clonedPath = await cloneRepository(
          io, // ✅ Ensure io is passed
          socket, // ✅ Ensure socket is passed
          repoUrl,
          branch,
          sessionId,
          projectName,
          repoPath,
          pomPath
        );

        socket.emit(
          "clone-log",
          `✅ Repository cloned successfully: ${clonedPath}`
        );
      } catch (error) {
        console.error(`❌ [Backend] Clone failed:`, error);
        socket.emit(
          "clone-log",
          `❌ ERROR: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ WebSocket Client disconnected [SESSION: ${sessionId}]`);
    });
  });
};

// ✅ Extract session ID from request headers
const extractSessionIdFromRequest = (
  request: IncomingMessage
): string | null => {
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => cookie.trim().split("="))
  );
  return cookies["sessionId"] || null;
};
