"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast, Toaster } from "sonner";
import { fetchProjects } from "../actions/action";
import { useSession } from "next-auth/react";

function ProjectList() {
  const { data: session } = useSession();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<string[]>([]);
  const backendUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_VITE_API_URL!
      : process.env.NEXT_PUBLIC_DEV_URL!;

  const sessionId = session?.user?.id;

  // Fetch projects on component mount
  useEffect(() => {
    const getProjects = async () => {
      if (!sessionId) return;
      const fetchedProjects = await fetchProjects(sessionId);
      if (!fetchedProjects) return;

      setProjects(fetchedProjects);

      // Set first project as active by default
      if (fetchedProjects.length > 0 && !selectedProject) {
        setSelectedProject(fetchedProjects[0]);
      }
    };

    getProjects();
  }, [sessionId]);

  const handleSelectProject = useCallback(
    async (project: string) => {
      setSelectedProject(project);

      try {
        if (!sessionId) return;

        const response = await fetch(`${backendUrl}/api/select-project`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({ projectName: project }),
        });

        if (!response.ok) {
          toast.error("Failed to select project.");
        } else {
          toast.success(`Project switched to ${project}`);
        }
      } catch (error) {
        console.error("❌ Project selection error:", error);
        toast.error("Failed to select project.");
      }
    },
    [backendUrl, sessionId]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      if (!projects.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = (index + 1) % projects.length;
        setSelectedProject(projects[nextIndex]);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prevIndex = (index - 1 + projects.length) % projects.length;
        setSelectedProject(projects[prevIndex]);
      } else if (event.key === "Enter") {
        handleSelectProject(selectedProject);
      }
    },
    [projects, selectedProject, handleSelectProject]
  );

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Project List</h3>
      <Toaster />
      {projects.length > 0 ? (
        <div className="space-y-2">
          {projects.map((project, index) => (
            <div
              key={project}
              onClick={() => handleSelectProject(project)}
              onKeyDown={(event) => handleKeyDown(event, index)}
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
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No projects available.</p>
      )}
    </div>
  );
}

export default ProjectList;
