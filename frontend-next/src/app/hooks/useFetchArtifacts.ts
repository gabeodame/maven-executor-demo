"use client";

import { useEffect, useState, useCallback } from "react";

import { useSessionCache } from "../store/SessionProvider";
import { useSocket } from "./useSocket"; // ✅ Listen for command completion
import { useSelectedProject } from "./useSelectedProject";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

export const useArtifacts = () => {
  const { sessionId } = useSessionCache();
  const { selectedProject } = useSelectedProject();
  const { commandCompleted } = useSocket(); // ✅ Detect when a command completes

  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);

  const isProd = process.env.NODE_ENV === "production";
  const backendUrl = isProd
    ? process.env.NEXT_PUBLIC_VITE_API_URL ||
      "https://maven-executor-demo.fly.dev"
    : "http://localhost:5001";

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

      if (!data || typeof data !== "object") {
        console.error("❌ Unexpected API response:", data);
        setArtifacts([]);
        return;
      }

      const projectArtifacts = data[selectedProject] || [];
      console.log(
        `📦 Artifacts updated for ${selectedProject}:`,
        projectArtifacts
      );
      setArtifacts(projectArtifacts);
    } catch (error) {
      console.error("❌ Error fetching artifacts:", error);
      setArtifacts([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId, selectedProject, backendUrl]);

  // ✅ Re-fetch artifacts when:
  //    1. `selectedProject` changes
  //    2. `commandCompleted` toggles (indicating a new build was created)
  useEffect(() => {
    fetchArtifacts();
  }, [selectedProject, commandCompleted, fetchArtifacts]);

  return { artifacts, loading, fetchArtifacts, setArtifacts };
};
