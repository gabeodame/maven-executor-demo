"use client";

import { useSessionCache } from "../hooks/useSessionCache";
import { useEffect, useState, useCallback } from "react";
import { useSelectedProject } from "./useSelectProject";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

export const useArtifacts = () => {
  const { sessionId } = useSessionCache();
  const { selectedProject } = useSelectedProject();

  const [artifacts, setArtifacts] = useState<Record<string, Artifact[]>>({});
  const [loading, setLoading] = useState(false);

  const isProd = process.env.NODE_ENV === "production";
  const backendUrl = isProd
    ? process.env.NEXT_PUBLIC_VITE_API_URL ||
      "https://maven-executor-demo.fly.dev"
    : "http://localhost:5001";

  const fetchArtifacts = useCallback(async () => {
    if (!sessionId || !selectedProject) {
      console.warn("⚠️ Waiting for session ID and selected project...");
      return;
    }

    setLoading(true);
    console.log(`Fetching artifacts for project: ${selectedProject}`);

    try {
      const res = await fetch(
        `${backendUrl}/api/artifacts?project=${encodeURIComponent(
          selectedProject
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();

      // ✅ Ensure correct data structure
      if (!data || typeof data !== "object") {
        console.error("❌ API returned unexpected format:", data);
        setArtifacts((prev) => ({
          ...prev,
          [selectedProject]: [], // ✅ Fallback to empty array
        }));
        return;
      }

      console.log("📦 Received Artifacts:", data);

      setArtifacts((prev) => ({
        ...prev,
        [selectedProject]: Array.isArray(data[selectedProject])
          ? data[selectedProject]
          : [], // ✅ Ensure it's an array
      }));
    } catch (error) {
      console.error("❌ Error fetching artifacts:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionId, selectedProject, backendUrl]);

  useEffect(() => {
    if (sessionId && selectedProject) {
      fetchArtifacts();
    }
  }, [sessionId, selectedProject, fetchArtifacts]);

  return { artifacts, loading, fetchArtifacts, setArtifacts };
};
