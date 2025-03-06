"use client";

interface ProjectItemProps {
  project: string;
  selectedProject: string | null;
  handleSelectProject: (projectName: string) => void;
  index: number;
}

function ProjectItem({
  project,
  selectedProject,
  handleSelectProject,
}: ProjectItemProps) {
  const isSelected = selectedProject === project;

  return (
    <button
      onClick={() => handleSelectProject(project)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleSelectProject(project);
        }
      }}
      role="button"
      tabIndex={0}
      className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium transition-all
        ${
          isSelected
            ? "bg-cyan-900 text-white font-bold shadow-lg"
            : "hover:bg-cyan-700 hover:text-white"
        }
      `}
      aria-pressed={isSelected} // ✅ Accessibility improvement
    >
      <span className="truncate">{project}</span>
      {isSelected && <span className="text-sm">✔</span>}{" "}
      {/* ✅ Active project indicator */}
    </button>
  );
}

export default ProjectItem;
