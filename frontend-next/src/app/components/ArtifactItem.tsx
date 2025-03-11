"use client";

import { useState, useCallback } from "react";
import { Artifact } from "../types/types";

interface ArtifactItemProps {
  artifact: Artifact;
  toggleExpand: (dirPath: string) => Promise<void>;
  expandedDirs: Record<string, Artifact[]>;
  handleDownload: (filePath: string) => void;
}

const ArtifactItem = ({
  artifact,
  toggleExpand,
  expandedDirs,
  handleDownload,
}: ArtifactItemProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleToggle = useCallback(async () => {
    if (!expanded) {
      await toggleExpand(artifact.path);
    }
    setExpanded((prev) => !prev);
  }, [expanded, artifact.path, toggleExpand]);

  return (
    <li className="text-sm">
      {artifact.type === "directory" ? (
        <>
          <button
            onClick={handleToggle}
            className="w-full flex items-center justify-between text-left px-2 py-1 rounded-md hover:bg-gray-600 transition duration-200"
          >
            <span className="truncate w-full flex items-center gap-2">
              <span className="text-lg">📂</span> {artifact.name}
            </span>
            <span className="text-gray-400 text-xs transition duration-200">
              {expanded ? "▼" : "▶"}
            </span>
          </button>

          {expandedDirs[artifact.path]?.length > 0 && (
            <ul className="ml-5 border-l-2 border-gray-600 pl-3 mt-1 space-y-1 transition-all duration-200">
              {expandedDirs[artifact.path].map((subArtifact) => (
                <ArtifactItem
                  key={subArtifact.path}
                  artifact={subArtifact}
                  toggleExpand={toggleExpand}
                  expandedDirs={expandedDirs}
                  handleDownload={handleDownload}
                />
              ))}
            </ul>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => handleDownload(artifact.path)}
          className="w-full text-left flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-700 transition duration-200"
        >
          <span className="text-lg">📄</span>
          <span className="truncate">{artifact.name}</span>
        </button>
      )}
    </li>
  );
};

export default ArtifactItem;
