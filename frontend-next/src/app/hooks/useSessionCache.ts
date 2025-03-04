import { useEffect, useState } from "react";
import { getBackEndUrl } from "../util/getbackEndUrl";

const SESSION_STORAGE_KEY = "app_session_id";

export const useSessionCache = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const backendUrl = getBackEndUrl();

  useEffect(() => {
    // ✅ Ensure we run only on the client side
    if (typeof window !== "undefined") {
      const cachedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (cachedSession) {
        return;
      }

      // ✅ Fetch session ID from API if not cached
      const fetchSession = async () => {
        try {
          const url = `${backendUrl}/api/get-session`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch session ID");
          const data = await res.json();

          setSessionId(data.sessionId);
          localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId); // ✅ Cache session ID
        } catch (error) {
          console.error("❌ Error fetching session ID:", error);
        }
      };

      fetchSession();
    }
  }, [backendUrl]);

  return sessionId;
};
