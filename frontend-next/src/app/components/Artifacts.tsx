"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import Accordion from "./ui/Accordion";
import { useArtifacts } from "../hooks/useFetchArtifacts";
import ArtifactItem from "./ArtifactItem";
import { useSelectedProject } from "../hooks/useSelectProject";
import { getBackEndUrl } from "../util/getbackEndUrl";
import { useSessionCache } from "../hooks/useSessionCache";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

export default function Artifacts() {
  const [resetting, setResetting] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, Artifact[]>>(
    {}
  );
  const { sessionId } = useSessionCache();

  const { loading, artifacts, setArtifacts } = useArtifacts();
  const { runMavenCommand } = useSocket();
  const { selectedProject } = useSelectedProject();
  const backendUrl = getBackEndUrl();

  const handleDownload = (filePath: string) => {
    const downloadUrl = `${backendUrl}/api/download?file=${encodeURIComponent(
      filePath
    )}`;
    window.open(downloadUrl, "_blank");
  };

  const handleReset = async () => {
    if (!selectedProject) return;

    setResetting(true);
    console.log("🧹 Resetting workspace for:", selectedProject);
    runMavenCommand("clean");

    try {
      const response = await fetch(`${backendUrl}/api/reset-artifacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId!,
        },
        body: JSON.stringify({ project: selectedProject }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset workspace");
      }

      console.log("✅ Workspace reset successfully");
      setArtifacts((prev) => ({
        ...prev,
        [selectedProject]: [],
      }));
    } catch (error) {
      console.error("❌ Error resetting workspace:", error);
    } finally {
      setResetting(false);
    }
  };

  const toggleExpand = async (dirPath: string) => {
    console.log("📂 Toggling directory:", dirPath);

    if (expandedDirs[dirPath]) {
      setExpandedDirs((prev) => {
        const newDirs = { ...prev };
        delete newDirs[dirPath];
        return newDirs;
      });
    } else {
      console.log(`📂 Fetching contents of: ${dirPath}`);
      try {
        const res = await fetch(
          `${backendUrl}/api/artifacts?path=${encodeURIComponent(dirPath)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );

        const data: Artifact[] = await res.json();
        console.log(`📂 Subdirectory Contents for ${dirPath}:`, data);

        setExpandedDirs((prev) => ({
          ...prev,
          [dirPath]: Array.isArray(data) ? data : [],
        }));
      } catch (error) {
        console.error("❌ Error fetching sub-artifacts:", error);
      }
    }
  };

  useEffect(() => {
    console.log("📌 Selected Project:", selectedProject);
  }, [selectedProject]);

  if (loading) {
    return <p className="text-center text-gray-400">Loading artifacts...</p>;
  }

  console.log("📦 Artifacts:", artifacts);
  console.log(
    "🔍 Selected Project Artifacts:",
    selectedProject ? artifacts[selectedProject] : "No project selected"
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-center">Build Artifacts</h2>

      {selectedProject && artifacts[selectedProject]?.length > 0 && (
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="mb-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:bg-gray-600 transition"
        >
          {resetting ? "🔄 Resetting..." : "🧹 Clean WorkSpace"}
        </button>
      )}

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {selectedProject && artifacts[selectedProject]?.length ? (
          <ul className="space-y-4">
            <li
              key={selectedProject}
              className="bg-gray-800 p-4 rounded-lg shadow"
            >
              <Accordion title={`📁 ${selectedProject}`} defaultOpen={false}>
                <ul className="ml-1 mt-2 border-l-2 border-gray-700 pl-3 space-y-1">
                  {artifacts[selectedProject]?.map((artifact) => (
                    <ArtifactItem
                      key={artifact.path}
                      artifact={artifact}
                      toggleExpand={toggleExpand}
                      expandedDirs={expandedDirs}
                      handleDownload={handleDownload}
                    />
                  ))}
                </ul>
              </Accordion>
            </li>
          </ul>
        ) : (
          <p className="text-gray-400 text-center">
            No build artifacts found for the selected project.
          </p>
        )}
      </div>
    </div>
  );
}
