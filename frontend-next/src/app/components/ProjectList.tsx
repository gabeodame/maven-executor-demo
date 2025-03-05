"use client";

import React, { useEffect, useState, useMemo } from "react";

import { useSessionCache } from "../hooks/useSessionCache";
import Accordion from "./ui/Accordion";
import ProjectItem from "./ProjectItem";
import { useSelectedProject } from "../hooks/useSelectProject";

function ProjectList() {
  // const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<string[]>([]);
  const { selectProject, selectedProject } = useSelectedProject();

  const { sessionId } = useSessionCache();

  const fetchProjects = useMemo(() => {
    return async function fetchProjects(sessionId: string) {
      console.log("📂 Fetching Projects from useMemo...");

      try {
        const backendUrl =
          process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_VITE_API_URL!
            : process.env.NEXT_PUBLIC_DEV_URL!;
        const res = await fetch(`${backendUrl}/api/user-projects`, {
          headers: {
            "x-session-id": sessionId,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch projects");

        const projectList: string[] = await res.json();
        console.log("📂 Fetched Projects:", projectList);
        return projectList;
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
      }
    };
  }, []);

  // const handleSelectProject = useCallback(
  //   async (project: string) => {
  //     setSelectedProject(project);

  //     try {
  //       if (!sessionId) return;

  //       const response = await fetch(`${backendUrl}/api/select-project`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "x-session-id": sessionId,
  //         },
  //         body: JSON.stringify({ projectName: project }),
  //       });

  //       if (!response.ok) {
  //         toast.error("Failed to select project.");
  //       } else {
  //         toast.success(`Project switched to ${project}`);
  //       }
  //     } catch (error) {
  //       console.error("❌ Project selection error:", error);
  //       toast.error("Failed to select project.");
  //     }
  //   },
  //   [backendUrl, sessionId]
  // );

  // Fetch projects on component mount
  useEffect(() => {
    if (!sessionId) return;
    const getProjects = async () => {
      const fetchedProjects = await fetchProjects(sessionId);
      if (fetchedProjects?.length) {
        setProjects(fetchedProjects);
        if (!selectedProject) {
          selectProject(fetchedProjects[0]); // ✅ Set first project as active by default
        }
      }
    };

    getProjects();
  }, [fetchProjects, selectedProject, sessionId, selectProject]); // ✅ Will re-run if sessionId updates

  // Handle keyboard navigation

  console.log(selectedProject);

  return (
    <Accordion
      title="Project List"
      bgColor="bg-gray-500"
      hoverColor="hover:bg-gray-600"
      titleSize=""
    >
      {projects.length > 0 ? (
        <div className="space-y-2">
          {projects.map((project, index) => (
            <ProjectItem
              project={project}
              index={index}
              handleSelectProject={() => selectProject(project)}
              key={index}
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
