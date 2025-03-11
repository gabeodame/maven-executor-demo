"use client";
import { FiTrash2 } from "react-icons/fi";

interface ProjectItemProps {
  project: string;
  selectedProject: string | null;
  handleSelectProject: (projectName: string) => void;
  handleDeleteProject: () => void; // ✅ New delete handler
  index: number;
}

function ProjectItem({
  project,
  selectedProject,
  handleSelectProject,
  handleDeleteProject,
}: ProjectItemProps) {
  return (
    <div
      key={project}
      className={`w-full flex justify-between items-center text-sm cursor-pointer p-3 rounded-lg border border-gray-600 transition min-h-[44px] ${
        selectedProject === project
          ? "bg-cyan-900 text-white font-bold shadow-md"
          : "hover:bg-cyan-700 hover:text-white"
      }`}
      style={{ transition: "all 0.2s ease-in-out" }} // ✅ Smooth transitions
    >
      <span onClick={() => handleSelectProject(project)} role="button">
        {project}
      </span>

      {/* 🗑️ Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteProject();
        }}
        className="text-red-300 hover:text-red-700 hover:scale-105 ease-in transition"
        aria-label={`Delete ${project}`}
      >
        {project !== "demo-java-app" && <FiTrash2 />}
      </button>
    </div>
  );
}

export default ProjectItem;
