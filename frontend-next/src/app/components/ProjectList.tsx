"use client";

import React, { useEffect, useRef } from "react";
import Accordion from "./ui/Accordion";
import ProjectItem from "./ProjectItem";
// import { useSessionCache } from "../store/react-context/SessionProvider";
// import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "../store/hooks/hooks";
import {
  fetchProjects,
  selectProjectThunk,
  deleteProjectThunk,
} from "../store/redux-toolkit/slices/projectSlice";
import { useSessionCache } from "../store/hooks/useSessionCache";
import { toast } from "sonner";

function ProjectList() {
  const dispatch = useAppDispatch();
  const { sessionId } = useSessionCache();
  const { projects, selectedProject } = useAppSelector(
    (state) => state.projects
  );
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!sessionId || hasFetched.current) return;

    dispatch(fetchProjects(sessionId));
    hasFetched.current = true;
  }, [dispatch, sessionId]);

  const handleSelectProject = (project: string) => {
    if (sessionId && project !== selectedProject) {
      dispatch(selectProjectThunk({ sessionId, project }));
    }
  };

  const handleDeleteProject = (project: string) => {
    if (!sessionId) return;

    if (project === "demo-java-app") {
      toast.error("❌ Cannot delete demo project.");
      return;
    }

    dispatch(deleteProjectThunk({ sessionId, project }));
  };

  return (
    <Accordion title="Project List">
      {projects.length > 0 ? (
        <div className="space-y-2">
          {projects.map((project, index) => (
            <ProjectItem
              index={index}
              key={project}
              project={project}
              handleSelectProject={() => handleSelectProject(project)}
              handleDeleteProject={() => handleDeleteProject(project)}
              selectedProject={selectedProject}
            />
          ))}
        </div>
      ) : (
        <p>No projects available.</p>
      )}
    </Accordion>
  );
}

export default ProjectList;
