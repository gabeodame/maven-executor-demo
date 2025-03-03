"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import Accordion from "./ui/Accordion";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

export default function Artifacts() {
  const { data: session } = useSession();
  const [artifacts, setArtifacts] = useState<Record<string, Artifact[]>>({});
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, Artifact[]>>(
    {}
  );

  const { runMavenCommand } = useSocket();
  const sessionId = session?.user?.id;

  const isProd = process.env.NODE_ENV === "production";
  const backendUrl = isProd
    ? process.env.NEXT_PUBLIC_VITE_API_URL ||
      "https://maven-executor-demo.fly.dev"
    : "http://localhost:5001";

  const handleDownload = (filePath: string) => {
    const downloadUrl = `${backendUrl}/api/download?file=${encodeURIComponent(
      filePath
    )}`;
    window.open(downloadUrl, "_blank");
  };

  const handleReset = async () => {
    setResetting(true);
    console.log("🧹 Resetting workspace...");
    runMavenCommand("clean");

    setTimeout(() => {
      setArtifacts({});
      setResetting(false);
    }, 1000);
  };

  useEffect(() => {
    if (!sessionId) return;

    const fetchArtifacts = async () => {
      console.log(`🔍 Fetching artifacts for session: ${sessionId}`);
      const url = `${backendUrl}/api/artifacts`;

      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
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
    };

    fetchArtifacts();
  }, [sessionId, backendUrl]);

  const toggleExpand = async (dirPath: string, projectName: string) => {
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
              ...(sessionId && { "x-session-id": sessionId }),
            },
          }
        );
        const data = await res.json();

        console.log(`📂 Subdirectory Contents for ${dirPath}:`, data);

        setExpandedDirs((prev) => ({
          ...prev,
          [`${projectName}/${dirPath}`]: Array.isArray(data) ? data : [],
        }));
      } catch (error) {
        console.error("❌ Error fetching sub-artifacts:", error);
      }
    }
  };

  const renderArtifacts = (projectName: string, artifacts: Artifact[]) => (
    <Accordion title={projectName} defaultOpen={false}>
      <ul className="w-full ml-4 mt-2 border-l-2 border-gray-700 pl-3 space-y-1">
        {artifacts.length > 0 ? (
          artifacts.map((artifact) => (
            <li
              key={`${projectName}/${artifact.path}`}
              className="bg-gray-700 p-2 rounded-md text-sm hover:bg-gray-600 transition"
            >
              {artifact.isDirectory ? (
                <>
                  <button
                    onClick={() => toggleExpand(artifact.path, projectName)}
                    className="w-full flex items-center justify-between text-left hover:text-blue-300 transition"
                  >
                    <span className="truncate w-full break-words">
                      {artifact.name}
                    </span>
                    {expandedDirs[`${projectName}/${artifact.path}`] ? (
                      <div className="flex items-center gap-0.5">
                        <span>📂 </span>
                        <span>▼</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5">
                        <span>📁 </span>
                        <span>▶</span>
                      </div>
                    )}
                  </button>

                  {/* ✅ Render subdirectory contents recursively */}
                  {expandedDirs[`${projectName}/${artifact.path}`] &&
                    renderArtifacts(
                      projectName,
                      expandedDirs[`${projectName}/${artifact.path}`]
                    )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDownload(artifact.path)}
                  className="w-full text-left hover:text-blue-400 truncate break-words transition"
                >
                  📄 {artifact.name}
                </button>
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-400 pl-4">📂 (Empty folder)</p>
        )}
      </ul>
    </Accordion>
  );

  if (loading) {
    return <p className="text-center text-gray-400">Loading artifacts...</p>;
  }

  return (
    <div className="w-full  max-w-4xl mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-center">Build Artifacts</h2>

      {Object.keys(artifacts).length > 0 && (
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
          {Object.keys(artifacts).length > 0 ? (
            Object.entries(artifacts).map(([projectName, projectArtifacts]) => {
              return (
                <li
                  key={projectName}
                  className="bg-gray-800 p-4 rounded-lg shadow"
                >
                  {/* <h3 className="text-lg font-semibold text-blue-400">
                    📁 {projectName}
                  </h3> */}
                  {renderArtifacts(projectName, projectArtifacts)}
                </li>
              );
            })
          ) : (
            <p className="text-gray-400 text-center">
              No build artifacts found.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}
