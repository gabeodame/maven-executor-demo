import { Server, Socket } from "socket.io";
import { runMavenCommand } from "../services/mavenService";
import {
  getJavaProjectPath,
  initializeSessionWorkspace,
} from "../config/projectPaths";
import { getSessionId } from "../services/sessionService";
import { IncomingMessage } from "http";

export const setupSocketRoutes = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    let sessionId = socket.handshake.auth?.sessionId;

    // ✅ Extract session ID from handshake headers if missing
    if (!sessionId) {
      console.log(
        "⚠️ No session ID in handshake auth, checking request headers..."
      );
      sessionId = extractSessionIdFromRequest(socket.request);
    }

    if (!sessionId) {
      console.log("❌ ERROR: No session ID provided!");
      socket.emit("maven-output", "❌ ERROR: No session ID provided!");
      socket.disconnect();
      return;
    }

    console.log(`✅ WebSocket Client connected [SESSION: ${sessionId}]`);

    // ✅ Ensure session workspace exists
    initializeSessionWorkspace(sessionId);

    socket.on("run-maven-command", (command: string) => {
      const javaProjectPath = getJavaProjectPath(sessionId);
      if (!javaProjectPath) {
        console.log(
          `❌ ERROR: Java project path is undefined for session ${sessionId}`
        );
        socket.emit("maven-output", "❌ ERROR: Java project path is undefined");
        return;
      }

      console.log(
        `📁 [SESSION: ${sessionId}] Using repo path: ${javaProjectPath}`
      );
      runMavenCommand(io, socket, command);
    });

    socket.on("disconnect", () => {
      console.log(`❌ WebSocket Client disconnected [SESSION: ${sessionId}]`);
    });
  });
};

// ✅ Function to extract session ID from the request headers
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
