import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * ✅ Retrieve or generate a session ID
 * - Uses `x-session-id` header if provided (from frontend Next.js app)
 * - Falls back to a cookie if available
 * - Creates a guest session if no session ID exists
 */
export const getSessionId = (req: Request, res: Response): string => {
  let sessionId =
    (req.headers["x-session-id"] as string) || req.cookies?.sessionId;

  if (!sessionId) {
    sessionId = `guest-${uuidv4().slice(0, 10)}`;
    console.log(`✅ New Guest Session Created: ${sessionId}`);

    // ✅ Store session ID in cookies for persistence
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return sessionId;
};
