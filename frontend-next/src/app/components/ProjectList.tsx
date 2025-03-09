"use client";

import React, { useEffect, useRef } from "react";
import Accordion from "./ui/Accordion";
import ProjectItem from "./ProjectItem";
import { useSessionCache } from "../store/react-context/SessionProvider";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  fetchProjects,
  selectProjectThunk,
} from "../store/redux-toolkit/slices/projectSlice";
import { getBackEndUrl } from "../util/getbackEndUrl";

function ProjectList() {
  const dispatch = useAppDispatch();
  const { projects, selectedProject, loading } = useAppSelector(
    (state) => state.projects
  );
  const { success } = useAppSelector((state) => state.repoCloneStatus);
  const { sessionId } = useSessionCache();

  const hasFetched = useRef(false);

  // ✅ Fetch Projects on Initial Mount
  useEffect(() => {
    if (!sessionId) return;
    console.log(
      "🚀 ~ file: ProjectList.tsx ~ line 33 ~ useEffect ~ sessionId",
      sessionId
    );
    dispatch(fetchProjects(sessionId))
      .unwrap()
      .then((projectList) => {
        if (projectList.length > 0) {
          const project = projectList[0];
          dispatch(selectProjectThunk({ sessionId, project })); // ✅ Select first project by default
        }
      })
      .catch((err) => toast.error(`Failed to fetch projects: ${err}`));

    hasFetched.current = true;
  }, [dispatch, sessionId, success]);

  console.log("📦 Projects:", projects);
  console.log("📦 Success:", success);

  // ✅ Handle Project Deletion
  const handleDeleteProject = async (projectName: string) => {
    if (!sessionId || !projectName.length) {
      console.warn("❌ Session ID or project name missing");
      return;
    }

    try {
      const backendUrl = getBackEndUrl();
      const response = await fetch(`${backendUrl}/api/delete-project`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ sessionId, projectName }),
      });

      if (!response.ok) throw new Error("Failed to delete project");

      toast.success(`🗑️ Project ${projectName} deleted successfully`);

      // ✅ Dispatch fetchProjects to update the list
      dispatch(fetchProjects(sessionId))
        .unwrap()
        .then((updatedProjects) => {
          const newDefault =
            updatedProjects.length > 0 ? updatedProjects[0] : null;
          if (newDefault) dispatch(selectProjectThunk(newDefault));
        });
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
      {loading && <p className="text-gray-400">Loading projects...</p>}

      {projects.length > 0 ? (
        <div className="space-y-2">
          {projects.map((project, index) => (
            <ProjectItem
              key={project}
              project={project}
              index={index}
              handleSelectProject={() => {
                if (sessionId) {
                  dispatch(selectProjectThunk({ sessionId, project }));
                }
              }}
              handleDeleteProject={() => handleDeleteProject(project)}
              selectedProject={selectedProject}
            />
          ))}

          {/* {error && <p className="text-red-500">{error}</p>} */}
        </div>
      ) : (
        !loading && <p className="text-gray-400">No projects available.</p>
      )}
    </Accordion>
  );
}

export default ProjectList;
