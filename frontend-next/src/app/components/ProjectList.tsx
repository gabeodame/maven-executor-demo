"use client";

import React, { useEffect, useState, useCallback } from "react";
import Accordion from "./ui/Accordion";
import ProjectItem from "./ProjectItem";
import { useSessionCache } from "../store/SessionProvider";
import { getBackEndUrl } from "../util/getbackEndUrl";
import { useSelectedProject } from "../hooks/useSelectedProject";

const PROJECT_STORAGE_KEY = "selectedProject";

function ProjectList() {
  const [projects, setProjects] = useState<string[]>([]);
  const { selectProject, selectedProject } = useSelectedProject();
  const { sessionId } = useSessionCache();

  // ✅ Fetch Projects
  const fetchProjects = useCallback(async () => {
    if (!sessionId) return;

    console.log("📂 Fetching Projects...");
    try {
      const backendUrl = getBackEndUrl();
      const res = await fetch(`${backendUrl}/api/user-projects`, {
        headers: { "x-session-id": sessionId },
      });

      if (!res.ok) throw new Error("Failed to fetch projects");

      const projectList: string[] = await res.json();
      console.log("📂 Fetched Projects:", projectList);
      setProjects(projectList);

      // ✅ Ensure global state stays in sync
      const cachedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (cachedProject && projectList.includes(cachedProject)) {
        if (cachedProject !== selectedProject) {
          selectProject(cachedProject); // ✅ Set global state
        }
      } else if (projectList.length > 0 && selectedProject !== projectList[0]) {
        selectProject(projectList[0]); // ✅ Default to first project
      }
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
    }
  }, [sessionId, selectedProject, selectProject]);

  // ✅ Fetch projects on sessionId change or first mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <Accordion
      title="Project List"
      bgColor="bg-gray-500"
      hoverColor="hover:bg-gray-600"
    >
      {projects.length > 0 ? (
        <div className="space-y-2">
          {projects.map((project, idx) => (
            <ProjectItem
              key={project}
              project={project}
              handleSelectProject={() => selectProject(project)}
              selectedProject={selectedProject}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No projects available.</p>
      )}
    </Accordion>
  );
}

export default ProjectList;
