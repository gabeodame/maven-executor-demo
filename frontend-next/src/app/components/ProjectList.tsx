"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Accordion from "./ui/Accordion";
import ProjectItem from "./ProjectItem";
import { useSessionCache } from "../store/SessionProvider";
import { getBackEndUrl } from "../util/getbackEndUrl";
import { useSelectedProject } from "../hooks/useSelectedProject";
import { toast } from "sonner";

const PROJECT_STORAGE_KEY = "selectedProject";

function ProjectList() {
  const [projects, setProjects] = useState<string[]>([]);
  const { selectProject, selectedProject, hasUserSelected } =
    useSelectedProject();
  const { sessionId } = useSessionCache();

  const hasFetched = useRef(false); // ✅ Prevent multiple fetches

  // ✅ Fetch Projects
  const fetchProjects = useCallback(async () => {
    if (!sessionId || hasFetched.current) return; // ✅ Prevent duplicate fetch

    console.log("📂 Fetching Projects...");
    try {
      const backendUrl = getBackEndUrl();
      const res = await fetch(`${backendUrl}/api/user-projects`, {
        headers: { "x-session-id": sessionId },
      });

      if (!res.ok) toast.error("Failed to fetch projects");

      const projectList: string[] = await res.json();
      console.log("📂 Fetched Projects:", projectList);
      setProjects(projectList);

      hasFetched.current = true; // ✅ Mark as fetched

      // ✅ Restore Cached Project or Default to First **ONLY IF USER HASN’T SELECTED ONE**
      if (!hasUserSelected.current) {
        const cachedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (cachedProject && projectList.includes(cachedProject)) {
          selectProject(cachedProject);
        } else if (projectList.length > 0) {
          selectProject(projectList[0]);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
    }
  }, [sessionId, selectProject, hasUserSelected]);

  // ✅ Fetch Projects on Initial Mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ✅ Handle Project Deletion
  const handleDeleteProject = async (projectName: string) => {
    if (!sessionId) {
      toast.error("Session ID missing. Please refresh and try again.");
      return;
    }

    if (projectName === "demo-java-app") {
      alert("You cannot delete default demo app");
      return;
    }

    const backendUrl = getBackEndUrl();

    try {
      const response = await fetch(`${backendUrl}/api/delete-project`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ projectName }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      toast.success(`🗑️ Project ${projectName} deleted successfully`);

      // ✅ Remove from project list
      const updatedProjects = projects.filter((p) => p !== projectName);
      setProjects(updatedProjects);

      // ✅ Set new default project
      if (selectedProject === projectName) {
        const newDefault =
          updatedProjects.length > 0 ? updatedProjects[0] : null;
        selectProject(newDefault as string);
      }
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      toast.error("Failed to delete project.");
    }
  };

  return (
    <Accordion
      title="Project List"
      bgColor="bg-gray-500"
      hoverColor="hover:bg-gray-600"
    >
      {projects.length > 0 ? (
        <div className="space-y-2">
          {projects.map((project, index) => (
            <ProjectItem
              key={project}
              project={project}
              index={index}
              handleSelectProject={() => {
                hasUserSelected.current = true; // ✅ User manually selected a project
                selectProject(project);
              }}
              handleDeleteProject={() => handleDeleteProject(project)} // ✅ Pass delete handler
              selectedProject={selectedProject}
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
