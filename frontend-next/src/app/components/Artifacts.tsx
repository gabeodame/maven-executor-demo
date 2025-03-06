"use client";

import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import Accordion from "./ui/Accordion";
import { useArtifacts } from "../hooks/useFetchArtifacts";
import ArtifactItem from "./ArtifactItem";

import { getBackEndUrl } from "../util/getbackEndUrl";
import { useSessionCache } from "../store/SessionProvider";
import { useSelectedProject } from "../hooks/useSelectedProject";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
  children?: Artifact[];
}

export default function Artifacts() {
  const [resetting, setResetting] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, Artifact[]>>(
    {}
  );

  const { artifacts, setArtifacts, fetchArtifacts } = useArtifacts();
  const { runMavenCommand } = useSocket();
  const { sessionId } = useSessionCache();
  const { selectedProject } = useSelectedProject();
  const backendUrl = getBackEndUrl();

  // ✅ Ensure artifacts update when `selectedProject` changes
  useEffect(() => {
    console.log(`🎯 Re-fetching artifacts for new project: ${selectedProject}`);
    fetchArtifacts();
  }, [selectedProject, fetchArtifacts]);

  const handleDownload = (filePath: string) => {
    const downloadUrl = `${backendUrl}/api/download?file=${encodeURIComponent(
      filePath
    )}`;
    window.open(downloadUrl, "_blank");
  };

  const handleReset = async () => {
    if (!selectedProject) return;

    setResetting(true);
    console.log(`🧹 Cleaning workspace for: ${selectedProject}`);

    runMavenCommand("clean");

    setArtifacts([]); // ✅ Clear artifacts immediately

    // ✅ Ensure artifacts refresh after reset
    setTimeout(() => {
      fetchArtifacts();
      setResetting(false);
    }, 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-center">Build Artifacts</h2>

      {artifacts.length > 0 && (
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
        <ul className="space-y-4">
          {selectedProject && artifacts.length > 0 ? (
            <li
              key={selectedProject}
              className="bg-gray-800 p-4 rounded-lg shadow"
            >
              <Accordion title={`📁 ${selectedProject}`} defaultOpen={false}>
                <ul className="ml-1 mt-2 border-l-2 border-gray-700 pl-3 space-y-1">
                  {artifacts.map((artifact) => (
                    <ArtifactItem
                      key={artifact.path}
                      artifact={artifact}
                      toggleExpand={async (dirPath) => {
                        console.log(`📂 Toggling ${dirPath}`);
                        if (expandedDirs[dirPath]) {
                          setExpandedDirs((prev) => {
                            const newDirs = { ...prev };
                            delete newDirs[dirPath];
                            return newDirs;
                          });
                        } else {
                          console.log(`📂 Fetching ${dirPath}`);
                          try {
                            const res = await fetch(
                              `${backendUrl}/api/artifacts?path=${encodeURIComponent(
                                dirPath
                              )}`,
                              {
                                method: "GET",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Cache-Control": "no-cache",
                                  "x-session-id": sessionId || "",
                                },
                              }
                            );
                            const data: Artifact[] = await res.json();
                            setExpandedDirs((prev) => ({
                              ...prev,
                              [dirPath]: data,
                            }));
                          } catch (error) {
                            console.error(
                              "❌ Error fetching sub-artifacts:",
                              error
                            );
                          }
                        }
                      }}
                      expandedDirs={expandedDirs}
                      handleDownload={handleDownload}
                    />
                  ))}
                </ul>
              </Accordion>
            </li>
          ) : (
            <p className="text-gray-400 text-center">
              No build artifacts found for the selected project.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
