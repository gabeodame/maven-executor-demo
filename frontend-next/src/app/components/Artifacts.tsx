"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

export default function Artifacts() {
  const { data: session } = useSession();
  const [builds, setBuilds] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, Artifact[]>>(
    {}
  );

  const { setLogs, runMavenCommand } = useSocket();

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

  const handleReset = async () => {
    setResetting(true);
    console.log("🧹 Resetting workspace...");
    runMavenCommand("clean");

    setTimeout(() => {
      setLogs([]);
      setResetting(false);
    }, 1000);
  };

  useEffect(() => {
    const fetchBuilds = async () => {
      console.log(`🔍 Fetching build history...`);
      try {
        const res = await fetch(`${backendUrl}/api/artifacts`);
        const data = await res.json();
        setBuilds(data);
      } catch (error) {
        console.error("❌ Error fetching builds:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!session) return;
    fetchBuilds();
  }, [session, backendUrl]);

  console.log("🔧 Artifacts:", builds);

  const toggleExpand = async (dirPath: string, event: React.MouseEvent) => {
    event.stopPropagation();
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
          { method: "GET", headers: { "Cache-Control": "no-cache" } }
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

  const renderArtifacts = (path: string, artifacts: Artifact[]) => (
    <ul className="ml-4 mt-2 border-l-2 border-gray-700 pl-3 space-y-1">
      {artifacts.length > 0 ? (
        artifacts.map((artifact) => (
          <li
            key={artifact.path}
            className="bg-gray-700 p-2 rounded-md items-start justify-between text-sm hover:bg-gray-600 transition"
          >
            {artifact.isDirectory ? (
              <>
                <button
                  onClick={(e) => toggleExpand(artifact.path, e)}
                  className="w-full flex items-center justify-between text-left hover:text-blue-300 transition"
                >
                  <span className="truncate w-full break-words">
                    {artifact.name}
                  </span>
                  {expandedDirs[artifact.path] ? (
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
                {expandedDirs[artifact.path] &&
                  renderArtifacts(artifact.path, expandedDirs[artifact.path])}
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
  );

  if (loading)
    return <p className="text-center text-gray-400">Loading artifacts...</p>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-center">Build Artifacts</h2>

      {builds.length > 0 && (
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="mb-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:bg-gray-600 transition"
        >
          {resetting ? "🔄 Resetting..." : "🧹 Reset Clean WorkSpace"}
        </button>
      )}

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <ul className="space-y-2 overflow-auto">
          {builds.length > 0 ? (
            builds.map((build) => (
              <li
                key={build.path}
                className="bg-gray-800 p-3 rounded-lg shadow overflow-auto"
              >
                <button
                  onClick={(e) => toggleExpand(build.path, e)}
                  className="w-full flex items-center text-sm text-left font-medium hover:text-blue-400 transition"
                >
                  {expandedDirs[build.path] ? (
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
                  <span className="truncate w-full break-words">
                    {build.name}
                  </span>
                </button>

                {/* ✅ Render the build contents */}
                {expandedDirs[build.path] &&
                  renderArtifacts(build.path, expandedDirs[build.path])}
              </li>
            ))
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
