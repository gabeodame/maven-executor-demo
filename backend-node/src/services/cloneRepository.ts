import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { setJavaProjectPath } from "../config/projectPaths";
import { Server, Socket } from "socket.io";

/**
 * Clones or updates a repository and streams logs via WebSocket.
 *
 * check socketRoutes.ts for usage
 */
