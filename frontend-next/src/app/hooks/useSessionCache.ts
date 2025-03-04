import { useEffect, useState } from "react";

const SESSION_STORAGE_KEY = "app_session_id";

export const useSessionCache = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Ensure we run only on the client side
    if (typeof window !== "undefined") {
      const cachedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (cachedSession) {
        setSessionId(cachedSession); // ✅ Use cached session if available
        console.log("✅ Using Cached Session ID:", cachedSession);
        return;
      }

      // ✅ Fetch session ID from API if not cached
      const fetchSession = async () => {
        try {
          const res = await fetch("/api/get-session");
          if (!res.ok) throw new Error("Failed to fetch session ID");
          const data = await res.json();

          setSessionId(data.sessionId);
          localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId); // ✅ Cache session ID
          console.log("✅ New Session ID Cached:", data.sessionId);
        } catch (error) {
          console.error("❌ Error fetching session ID:", error);
        }
      };

      fetchSession();
    }
  }, []);

  return sessionId;
};
