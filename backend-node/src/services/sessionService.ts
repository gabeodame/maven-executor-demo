import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * ✅ Retrieve or persist a session ID
 * - Uses `x-session-id` from the frontend if provided
 * - Falls back to a cookie if available
 * - Creates a guest session only if no existing session is found
 */

// Session Expiry Durations
const AUTH_SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days for authenticated users
const GUEST_SESSION_EXPIRY = 30 * 60 * 1000; // 30 minutes for guest users

// In-memory session cache
const sessionCache = new Map<string, { expiresAt: number }>();

export const getSessionId = (
  req: Request,
  res: Response
): { session: string } | undefined => {
  let sessionId: string =
    (req.headers["x-session-id"] as string) || req.cookies?.sessionId;

  // Check if session exists in cache and is valid
  if (sessionId && sessionCache.has(sessionId)) {
    const cachedSession = sessionCache.get(sessionId);
    if (cachedSession && cachedSession.expiresAt > Date.now()) {
      console.log(`✅ Using Cached Session: ${sessionId}`);
      return { session: sessionId };
    }
    console.log(`⚠️ Expired session detected, creating a new one.`);
    sessionCache.delete(sessionId);
  }

  // Check if user is authenticated
  const isAuthenticated = !!req.headers["x-user-id"];
  const expiry = isAuthenticated ? AUTH_SESSION_EXPIRY : GUEST_SESSION_EXPIRY;

  // If guest, assign a guest session ID
  if (!sessionId || sessionId.startsWith("guest-")) {
    sessionId = isAuthenticated
      ? (req.headers["x-user-id"] as string)
      : `guest-${uuidv4().slice(0, 10)}`;
    console.log(
      `✅ New Session Created: ${sessionId} (Expiry: ${
        isAuthenticated ? "7 days" : "30 minutes"
      })`
    );
  }

  // Store session in cache
  sessionCache.set(sessionId, { expiresAt: Date.now() + expiry });

  // Store session in cookies
  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expiry,
  });

  res.json({ sessionId });
};
