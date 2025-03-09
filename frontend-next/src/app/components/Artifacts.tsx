"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../hooks/useSocket";
import Accordion from "./ui/Accordion";
import ArtifactItem from "./ArtifactItem";
import { useSessionCache } from "../store/react-context/SessionProvider";

import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  fetchArtifactsFromApi,
  fetchSubArtifactsFromApi,
} from "../store/redux-toolkit/slices/artifactSlice";
import { getBackEndUrl } from "../util/getbackEndUrl";

export default function Artifacts() {
  const dispatch = useAppDispatch();
  const artifacts = useAppSelector((state) => state.artifacts.artifacts);
  const expandedDirs = useAppSelector((state) => state.artifacts.expandedDirs); // ✅ Redux-managed expandedDirs
  const selectedProject = useAppSelector(
    (state) => state.projects.selectedProject
  );

  const loading = useAppSelector((state) => state.artifacts.loading);
  const { commandCompleted, runMavenCommand } = useSocket();
  const { sessionId } = useSessionCache();

  const [resetting, setResetting] = useState(false); // ✅ Local state for reset status
  // ✅ Fetch artifacts when project changes or Maven command completes
  useEffect(() => {
    if (sessionId && selectedProject) {
      dispatch(fetchArtifactsFromApi({ sessionId, selectedProject }));
    }
  }, [sessionId, selectedProject, commandCompleted, dispatch]);

  console.log("📦 selectedProject:", selectedProject);
  console.log("📦 Artifacts:", artifacts);

  // ✅ Use Redux thunk to fetch sub-artifacts instead of direct API fetch
  const toggleExpand = useCallback(
    async (dirPath: string) => {
      console.log(`📂 Toggling ${dirPath}`);

      if (expandedDirs[dirPath]) {
        dispatch({ type: "artifacts/collapseDir", payload: dirPath });
      } else {
        if (sessionId) {
          dispatch(fetchSubArtifactsFromApi({ sessionId, dirPath }));
        }
      }
    },
    [expandedDirs, sessionId, dispatch]
  );

  const handleDownload = (filePath: string) => {
    const backendUrl = getBackEndUrl();
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

    setTimeout(() => {
      if (sessionId) {
        dispatch(fetchArtifactsFromApi({ sessionId, selectedProject }));
      }
      setResetting(false);
    }, 3000);
  };

  // ✅ Ensure loading state is handled
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="relative flex">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Build Artifacts</h2>

      {artifacts.length > 0 && (
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="mb-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:bg-gray-600 transition"
        >
          {resetting ? "🔄 Resetting..." : "🧹 Clean Workspace"}
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
                      toggleExpand={toggleExpand} // ✅ Pass Redux-managed function
                      expandedDirs={expandedDirs} // ✅ Use Redux-managed expandedDirs
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
