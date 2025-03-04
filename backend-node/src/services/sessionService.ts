import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * ✅ Retrieve or persist a session ID
 * - Uses `x-session-id` from the frontend if provided
 * - Falls back to a cookie if available
 * - Creates a guest session only if no existing session is found
 */
export const getSessionId = (req: Request, res: Response): string => {
  let sessionId =
    (req.headers["x-session-id"] as string) || req.cookies?.sessionId;

  // ✅ If a guest session exists, reuse it instead of creating a new one
  if (sessionId?.startsWith("guest-")) {
    console.log(`🔄 Reusing existing guest session: ${sessionId}`);
  }

  // ✅ Transition guest to actual user if logged in
  if (sessionId?.startsWith("guest-") && req.headers["x-user-id"]) {
    const userId = req.headers["x-user-id"] as string;
    console.log(
      `🔄 Converting guest session ${sessionId} to user session ${userId}`
    );
    sessionId = userId;
  }

  // ✅ Create a new guest session only if no valid session exists
  if (!sessionId) {
    sessionId = `guest-${uuidv4().slice(0, 10)}`;
    console.log(`✅ New Guest Session Created: ${sessionId}`);
  }

  // ✅ Store session ID in cookies for persistence (30 min for guests, 24h for logged-in users)
  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: req.headers["x-user-id"] ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000, // 24h for logged-in users, 30m for guests
  });

  return sessionId;
};
