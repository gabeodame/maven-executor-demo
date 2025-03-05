"use client";

import { useState } from "react";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
}

interface ArtifactItemProps {
  artifact: Artifact;
  toggleExpand: (dirPath: string) => Promise<void>;
  expandedDirs: Record<string, Artifact[]>;
  handleDownload: (filePath: string) => void;
}

const ArtifactItem: React.FC<ArtifactItemProps> = ({
  artifact,
  toggleExpand,
  expandedDirs,
  handleDownload,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = async () => {
    await toggleExpand(artifact.path);
    setExpanded((prev) => !prev);
  };

  return (
    <li className="text-sm">
      {artifact.isDirectory ? (
        <>
          <button
            onClick={handleToggle}
            className="w-full flex items-center justify-between text-left px-2 py-1 rounded-md hover:bg-gray-600 transition"
          >
            <span className="truncate w-full flex items-center gap-2">
              <span className="text-lg">📂</span> {artifact.name}
            </span>
            <span className="text-gray-400 text-xs">
              {expanded ? "▼" : "▶"}
            </span>
          </button>

          {/* ✅ Recursively render subdirectory contents with improved spacing */}
          {expandedDirs[artifact.path] &&
            expandedDirs[artifact.path].length > 0 && (
              <ul className="ml-5 border-l-2 border-gray-600 pl-3 mt-1 space-y-1">
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
          className="w-full text-left flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-700 transition"
        >
          <span className="text-lg">📄</span>
          <span className="truncate">{artifact.name}</span>
        </button>
      )}
    </li>
  );
};

export default ArtifactItem;
