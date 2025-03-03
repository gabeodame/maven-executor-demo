import fs from "fs";
import path from "path";

const SESSION_WORKSPACE_DIR = "/app/workspaces";
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // ✅ 30 minutes inactivity

export const cleanupInactiveWorkspaces = () => {
  console.log("🧹 Running workspace cleanup...");

  fs.readdir(SESSION_WORKSPACE_DIR, (err, sessions) => {
    if (err) {
      console.error("❌ ERROR: Failed to read workspace directory:", err);
      return;
    }

    const now = Date.now();
    sessions.forEach((session) => {
      const sessionPath = path.join(SESSION_WORKSPACE_DIR, session);
      fs.stat(sessionPath, (err, stats) => {
        if (err) {
          console.error(`❌ ERROR: Failed to stat ${sessionPath}`, err);
          return;
        }

        // ✅ Remove only guest sessions that have been inactive
        if (
          session.startsWith("guest-") &&
          now - stats.mtimeMs > INACTIVITY_LIMIT_MS
        ) {
          console.log(`🗑️ Removing inactive guest workspace: ${sessionPath}`);
          fs.rm(sessionPath, { recursive: true, force: true }, (err) => {
            if (err) {
              console.error(`❌ ERROR: Failed to delete ${sessionPath}`, err);
            } else {
              console.log(
                `✅ Deleted inactive guest workspace: ${sessionPath}`
              );
            }
          });
        }
      });
    });
  });
};

// ✅ Run Cleanup Every 10 Minutes
setInterval(cleanupInactiveWorkspaces, 10 * 60 * 1000);
