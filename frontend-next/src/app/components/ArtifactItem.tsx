"use client";

interface Artifact {
  name: string;
  isDirectory: boolean;
  path: string;
  children?: Artifact[]; // ✅ Ensure `children` is part of the Artifact type
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
  // ✅ Expansion state is derived from `expandedDirs`
  const isExpanded = expandedDirs.hasOwnProperty(artifact.path);

  const handleToggle = async () => {
    await toggleExpand(artifact.path);
  };

  return (
    <li className="bg-gray-700 p-2 rounded-md text-sm hover:bg-gray-600 transition">
      {artifact.isDirectory ? (
        <>
          <button
            onClick={handleToggle}
            className="w-full flex items-center justify-between text-left hover:text-blue-300 transition"
          >
            <span className="truncate w-full break-words">
              <span>📂</span> {artifact.name}
            </span>
            {isExpanded ? <span>▼</span> : <span>▶</span>}
          </button>

          {/* ✅ Recursively render `children` or `expandedDirs` */}
          {isExpanded &&
            Array.isArray(expandedDirs[artifact.path]) &&
            expandedDirs[artifact.path].length > 0 && (
              <ul className="ml-5 border-l-2 border-gray-600 pl-3 text-wrap">
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
          className="w-full text-left text-wrap hover:text-blue-400 truncate break-words transition"
        >
          📄 {artifact.name}
        </button>
      )}
    </li>
  );
};

export default ArtifactItem;
