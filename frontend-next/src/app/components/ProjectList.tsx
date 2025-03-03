"use client";

import React, { useEffect, useState } from "react";
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
      const projects = await fetchProjects(sessionId);
      if (!projects) return;
      setProjects(projects);

      // Set first project as active by default
      if (projects.length > 0 && !selectedProject) {
        setSelectedProject(projects[0]);
      }
    };
    getProjects();
  }, [sessionId]);

  const handleSelectProject = async (project: string) => {
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
  };

  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-semibold mb-2">Project List</h3>
      <Toaster />
      {projects.length > 0 ? (
        projects.map((project) => (
          <div key={project} className="w-full flex gap-2">
            <span
              onClick={() => handleSelectProject(project)}
              className={`w-full text-sm cursor-pointer p-2 text-wrap border-b border-gray-500 transition rounded-md ${
                selectedProject === project
                  ? "bg-cyan-900 text-white" // ✅ Active project color
                  : "hover:bg-cyan-900 hover:text-white"
              }`}
            >
              {project}
            </span>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No projects available.</p>
      )}
    </div>
  );
}

export default ProjectList;
