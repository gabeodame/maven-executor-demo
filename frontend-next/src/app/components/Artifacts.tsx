"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

export default function Artifacts() {
  const { data: session } = useSession();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, Artifact[]>>(
    {}
  );

  const isProd = process.env.NODE_ENV === "production";
  const backendUrl = isProd
    ? process.env.NEXT_PUBLIC_VITE_API_URL ||
      "https://maven-executor-demo.fly.dev"
    : "http://localhost:5001";

  const handleDownload = (filePath: string) => {
    const downloadUrl = `${backendUrl}/api/download?file=${encodeURIComponent(
      filePath
    )}`;
    console.log(`📥 Downloading: ${downloadUrl}`);
    window.open(downloadUrl, "_blank");
  };

  useEffect(() => {
    const fetchArtifacts = async (folderPath = "") => {
      console.log(`🔍 Fetching artifacts from: ${folderPath || "root"}`);
      try {
        const res = await fetch(
          `${backendUrl}/api/artifacts${
            folderPath ? `?path=${encodeURIComponent(folderPath)}` : ""
          }`
        );
        const data = await res.json();

        if (data.error) {
          console.warn("⚠️ No artifacts found:", data.error);
        } else {
          if (folderPath) {
            setExpandedDirs((prev) => ({ ...prev, [folderPath]: data }));
          } else {
            setArtifacts(data);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching artifacts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!session) return;
    fetchArtifacts();
  }, [session, backendUrl]);

  const toggleExpand = (dirPath: string) => {
    if (expandedDirs[dirPath]) {
      // Collapse if already expanded
      setExpandedDirs((prev) => {
        const newDirs = { ...prev };
        delete newDirs[dirPath];
        return newDirs;
      });
    } else {
      // Expand by fetching contents
      fetch(`${backendUrl}/api/artifacts?path=${encodeURIComponent(dirPath)}`)
        .then((res) => res.json())
        .then((data) => {
          setExpandedDirs((prev) => ({ ...prev, [dirPath]: data }));
        })
        .catch((error) =>
          console.error("❌ Error fetching sub-artifacts:", error)
        );
    }
  };

  if (loading) return <p>Loading artifacts...</p>;

  return (
    <div className="w-full mx-auto mt-6 p-4 bg-gray-900 text-white rounded-lg shadow-md overflow-auto">
      <h2 className="text-xl font-bold mb-4">Build Artifacts</h2>
      {artifacts.length === 0 ? (
        <p>
          No build artifacts found. Run a Maven command to generate artifacts.
        </p>
      ) : (
        <ul className="space-y-2">
          {artifacts.map((artifact) => (
            <li key={artifact.path} className="bg-gray-800 p-3 rounded-md">
              {artifact.isDirectory ? (
                <>
                  <button
                    onClick={() => toggleExpand(artifact.path)}
                    className="w-full text-left flex items-center gap-2 hover:text-blue-400"
                  >
                    {expandedDirs[artifact.path] ? "📂 ▼" : "📁 ▶"}{" "}
                    {artifact.name}
                  </button>
                  {expandedDirs[artifact.path] && (
                    <ul className="ml-6 mt-2 space-y-2">
                      {expandedDirs[artifact.path].length === 0 ? (
                        <li className="text-gray-400">📂 (Empty folder)</li>
                      ) : (
                        expandedDirs[artifact.path].map((subArtifact) => (
                          <li
                            key={subArtifact.path}
                            className="bg-gray-700 p-2 rounded-md"
                          >
                            {subArtifact.isDirectory ? (
                              <button
                                onClick={() => toggleExpand(subArtifact.path)}
                                className="w-full text-left flex items-center gap-2 hover:text-blue-300"
                              >
                                {expandedDirs[subArtifact.path]
                                  ? "📂 ▼"
                                  : "📁 ▶"}{" "}
                                {subArtifact.name}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDownload(subArtifact.path)}
                                className="hover:text-blue-400"
                              >
                                📄 {subArtifact.name}
                              </button>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDownload(artifact.path)}
                  className="hover:text-blue-400"
                >
                  📄 {artifact.name}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
