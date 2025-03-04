"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSocket } from "../hooks/useSocket";
import Accordion from "./ui/Accordion";
import { useSessionCache } from "../hooks/useSessionCache";
import { useArtifacts } from "../hooks/useFetchArtifacts";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

export default function Artifacts() {
  const { data: session } = useSession();
  // const [artifacts, setArtifacts] = useState<Record<string, Artifact[]>>({});
  const [resetting, setResetting] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, Artifact[]>>(
    {}
  );

  const { loading, artifacts, setArtifacts } = useArtifacts();

  const { runMavenCommand } = useSocket();
  const cachedSessionId = useSessionCache(); // ✅ Use cached session for guests
  const sessionId = session?.user?.id || cachedSessionId; // ✅ Use actual session ID if available

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

    if (!loading) {
      setArtifacts({});
      setResetting(false);
    }
  };

  // useEffect(() => {
  //   if (!sessionId) return;
  //   fetchArtifacts();
  // }, [sessionId, backendUrl, fetchArtifacts]);

  const toggleExpand = async (dirPath: string, projectName: string) => {
    console.log("📂 Toggling directory:", dirPath, projectName);

    if (expandedDirs[dirPath]) {
      // Collapse directory
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
          [dirPath]: Array.isArray(data) ? data : [],
        }));
      } catch (error) {
        console.error("❌ Error fetching sub-artifacts:", error);
      }
    }
  };

  const renderArtifacts = (artifacts: Artifact[], parentPath = "") => (
    <ul className="ml-4 mt-2 border-l-2 border-gray-700 pl-3 space-y-1">
      {artifacts.length > 0 ? (
        artifacts.map((artifact) => {
          const fullPath = `${parentPath}/${artifact.name}`;

          return (
            <li
              key={fullPath}
              className="bg-gray-700 p-2 rounded-md text-sm hover:bg-gray-600 transition"
            >
              {artifact.isDirectory ? (
                <>
                  <button
                    onClick={() => toggleExpand(artifact.path, fullPath)}
                    className="w-full flex items-center justify-between text-left hover:text-blue-300 transition"
                  >
                    <span className="truncate w-full break-words">
                      {artifact.name}
                    </span>
                    {expandedDirs[artifact.path] ? (
                      <span>📂 ▼</span>
                    ) : (
                      <span>📁 ▶</span>
                    )}
                  </button>

                  {/* ✅ Render subdirectory contents recursively */}
                  {expandedDirs[artifact.path] &&
                    expandedDirs[artifact.path].length > 0 && (
                      <div className="ml-5 border-l-2 border-gray-600 pl-3">
                        {renderArtifacts(expandedDirs[artifact.path], fullPath)}
                      </div>
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
          );
        })
      ) : (
        <p className="text-gray-400 pl-4">📂 (Empty folder)</p>
      )}
    </ul>
  );

  if (loading) {
    return <p className="text-center text-gray-400">Loading artifacts...</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-md overflow-hidden">
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
                  <Accordion title={`📁 ${projectName}`} defaultOpen={false}>
                    {renderArtifacts(projectArtifacts, projectName)}
                  </Accordion>
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
