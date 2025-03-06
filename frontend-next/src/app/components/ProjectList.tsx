"use client";

import React, { useEffect, useState, useCallback } from "react";
import Accordion from "./ui/Accordion";
import ProjectItem from "./ProjectItem";
import { useSessionCache } from "../store/SessionProvider";
import { useSelectedProject } from "../hooks/useSelectProject";
import { getBackEndUrl } from "../util/getbackEndUrl";

const PROJECT_STORAGE_KEY = "selectedProject";

function ProjectList() {
  const [projects, setProjects] = useState<string[]>([]);
  const { selectProject, selectedProject } = useSelectedProject();
  const { sessionId } = useSessionCache();

  // ✅ Fetch projects from backend
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

      // ✅ Restore Cached Project or Default to First if No Selection
      const cachedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (!selectedProject || !projectList.includes(selectedProject)) {
        const projectToSelect =
          cachedProject && projectList.includes(cachedProject)
            ? cachedProject
            : projectList[0];

        if (projectToSelect) selectProject(projectToSelect);
      }
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
    }
  }, [sessionId, selectProject, selectedProject]);

  // ✅ Fetch projects on mount or session change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <Accordion
      title="Project List"
      bgColor="bg-gray-500"
      hoverColor="hover:bg-gray-600"
    >
      {projects.length ? (
        <div className="space-y-2">
          {projects.map((project, idx) => (
            <ProjectItem
              key={project} // ✅ Use project name as key
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
