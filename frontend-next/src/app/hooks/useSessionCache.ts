import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getBackEndUrl } from "../util/getbackEndUrl";

const SESSION_STORAGE_KEY = "sessionId";

export const useSessionCache = () => {
  const { data: session, status } = useSession();
  const [sessionId, setSessionId] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem(SESSION_STORAGE_KEY)
      : null
  );
  const backendUrl = getBackEndUrl();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      console.log("🔄 Updating stored session to:", session.user.id);
      localStorage.setItem(SESSION_STORAGE_KEY, session.user.id);
      setSessionId(session.user.id);
    }
  }, [session, status]);

  // ✅ Function to explicitly fetch guest session if user selects "Continue as Guest"
  const fetchGuestSession = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/get-session`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to fetch session ID");

      const data = await res.json();
      console.log("✅ Guest session created:", data.sessionId);
      localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
      setSessionId(data.sessionId);
    } catch (error) {
      console.error("❌ Error fetching session ID:", error);
    }
  };

  return { sessionId, fetchGuestSession };
};
