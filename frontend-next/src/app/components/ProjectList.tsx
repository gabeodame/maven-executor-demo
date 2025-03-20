"use client";

import React, { useEffect, useState } from "react";
import Accordion from "./ui/Accordion";
import ProjectItem from "./ProjectItem";
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    dispatch(fetchProjects(sessionId));
  }, [dispatch, sessionId]);

  // ✅ Manually refresh projects
  const handleRefresh = () => {
    if (!sessionId) return;
    setIsRefreshing(true);
    dispatch(fetchProjects(sessionId))
      .unwrap()
      .catch(() => toast.error("❌ Failed to refresh project list."))
      .finally(() => setIsRefreshing(false));
  };

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
    <Accordion title={Trigger({ isRefreshing, handleRefresh })}>
      <div className="flex justify-between items-center mb-2"></div>

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

type TriggerProps = {
  isRefreshing: boolean;
  handleRefresh: () => void;
};

const Trigger = ({ isRefreshing, handleRefresh }: TriggerProps) => {
  return (
    <div
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        handleRefresh();
      }}
      // disabled={isRefreshing}
      className="w-full text-white px-4 py-2 rounded-md disabled:bg-gray-600 transition"
    >
      {isRefreshing ? (
        "🔄 Refreshing..."
      ) : (
        <div className="w-full flex items-center justify-between">
          <span>Project List</span> <span>🔄</span>
        </div>
      )}
    </div>
  );
};
