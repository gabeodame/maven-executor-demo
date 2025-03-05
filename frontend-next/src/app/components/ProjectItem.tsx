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
  return (
    <div
      key={project}
      onClick={() => handleSelectProject(project)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleSelectProject(project);
        }
      }}
      role="button"
      tabIndex={0}
      className={`w-full text-sm cursor-pointer p-3 rounded-lg border border-gray-600 transition ${
        selectedProject === project
          ? "bg-cyan-900 text-white font-bold shadow-md" // Active project styling
          : "hover:bg-cyan-700 hover:text-white"
      }`}
    >
      {project}
    </div>
  );
}

export default ProjectItem;
