"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Accordion from "./ui/Accordion";
import ProjectItem from "./ProjectItem";

import { getBackEndUrl } from "../util/getbackEndUrl";
import { useSelectedProject } from "../hooks/useSelectedProject";
import { toast } from "sonner";
import { useSessionCache } from "../store/react-context/SessionProvider";

const PROJECT_STORAGE_KEY = "selectedProject";

function ProjectList() {
  const [projects, setProjects] = useState<string[]>([]);
  const { selectProject, selectedProject, hasUserSelected } =
    useSelectedProject();
  const { sessionId } = useSessionCache();

  const hasFetched = useRef(false);

  console.log("🔄 Rendering ProjectList", { selectedProject, projects });

  // ✅ Fetch Projects
  const fetchProjects = useCallback(async () => {
    if (!sessionId || hasFetched.current) return;

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
      hasFetched.current = true;

      // ✅ Restore Cached Project or Default to First **ONLY IF USER HASN’T SELECTED ONE**
      if (!hasUserSelected.current) {
        const cachedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (cachedProject && projectList.includes(cachedProject)) {
          console.log("✅ Restoring Cached Project:", cachedProject);
          selectProject(cachedProject);
        } else if (projectList.length > 0) {
          console.log("✅ Setting Default Project:", projectList[0]);
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

      const updatedProjects = projects.filter((p) => p !== projectName);
      console.log("✅ Updated Projects After Deletion:", updatedProjects);
      setProjects(updatedProjects);

      if (selectedProject === projectName) {
        const newDefault =
          updatedProjects.length > 0 ? updatedProjects[0] : null;
        console.log("✅ Selecting New Default Project:", newDefault);
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
                console.log("🖱️ User Selected Project:", project);
                hasUserSelected.current = true;
                selectProject(project);
              }}
              handleDeleteProject={() => handleDeleteProject(project)}
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
