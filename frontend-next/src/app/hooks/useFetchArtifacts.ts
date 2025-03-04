"use client";

import { useSessionCache } from "../hooks/useSessionCache";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

export const useArtifacts = () => {
  const { data: session } = useSession();
  const cachedSessionId = useSessionCache(); // ✅ Use cached session for guests
  const sessionId = session?.user?.id || cachedSessionId; // ✅ Use actual session ID if available
  const { loading: socketStatus } = useSocket();

  const [artifacts, setArtifacts] = useState<Record<string, Artifact[]>>({});
  const [loading, setLoading] = useState(true);

  const isProd = process.env.NODE_ENV === "production";
  const backendUrl = isProd
    ? process.env.NEXT_PUBLIC_VITE_API_URL ||
      "https://maven-executor-demo.fly.dev"
    : "http://localhost:5001";

  // 🔄 Fetch artifacts function (callable from outside)
  const fetchArtifacts = useCallback(async () => {
    if (!sessionId) {
      console.warn("⚠️ Waiting for session ID before fetching artifacts...");
      return;
    }

    setLoading(true);
    const url = `${backendUrl}/api/artifacts`;

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(sessionId && { "x-session-id": sessionId }),
        },
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data: Record<string, Artifact[]> = await res.json();
      console.log("📂 Fetched Artifacts:", data);
      setArtifacts(data);
    } catch (error) {
      console.error("❌ Error fetching artifacts:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, backendUrl]);

  // 📌 Fetch on sessionId change
  useEffect(() => {
    if (sessionId || !socketStatus) {
      fetchArtifacts();
    }
  }, [sessionId, fetchArtifacts, socketStatus]);

  return { artifacts, loading, fetchArtifacts, setArtifacts };
};
