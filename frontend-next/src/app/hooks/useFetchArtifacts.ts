"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelectedProject } from "./useSelectProject";
import { useSessionCache } from "../store/SessionProvider";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

export const useArtifacts = () => {
  const { sessionId } = useSessionCache();
  const { selectedProject } = useSelectedProject();

  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);

  const isProd = process.env.NODE_ENV === "production";
  const backendUrl = isProd
    ? process.env.NEXT_PUBLIC_VITE_API_URL ||
      "https://maven-executor-demo.fly.dev"
    : "http://localhost:5001";

  // ✅ Fetch only artifacts for the selected project
  const fetchArtifacts = useCallback(async () => {
    if (!sessionId || !selectedProject) {
      console.warn("⚠️ No session ID or selected project. Skipping fetch.");
      return;
    }

    setLoading(true);
    console.log(`🔄 Fetching artifacts for: ${selectedProject}`);

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
        throw new Error(`❌ Server responded with status ${res.status}`);
      }

      const data = await res.json();

      // ✅ Ensure correct data structure
      if (!data || typeof data !== "object") {
        console.error("❌ Unexpected API response:", data);
        setArtifacts([]); // Fallback to empty array
        return;
      }

      // ✅ Extract artifacts for the selected project
      const projectArtifacts = data[selectedProject] || [];
      console.log(
        `📦 Artifacts updated for ${selectedProject}:`,
        projectArtifacts
      );
      setArtifacts(projectArtifacts);
    } catch (error) {
      console.error("❌ Error fetching artifacts:", error);
      setArtifacts([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  }, [sessionId, selectedProject, backendUrl]);

  // ✅ Re-fetch artifacts when `selectedProject` changes
  useEffect(() => {
    fetchArtifacts();
  }, [selectedProject, fetchArtifacts]);

  return { artifacts, loading, fetchArtifacts, setArtifacts };
};
