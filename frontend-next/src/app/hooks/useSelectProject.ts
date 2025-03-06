import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { getBackEndUrl } from "../util/getbackEndUrl";
import { useMenu } from "../store/MenuContext";
import { useIsMobile } from "./useIsMobile";
import { useSessionCache } from "../store/SessionProvider";

export const useSelectedProject = () => {
  const { sessionId } = useSessionCache();
  const backendUrl = getBackEndUrl();
  const { toggleMenu } = useMenu();
  const isMobile = useIsMobile();

  // ✅ Load selected project from localStorage on mount
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProject = localStorage.getItem("selectedProject");
      if (storedProject) {
        setSelectedProject(storedProject);
      }
    }
  }, []);

  // ✅ Function to select a project and notify the backend
  const selectProject = useCallback(
    async (project: string) => {
      if (!project || project === selectedProject) return;

      setSelectedProject(project);
      localStorage.setItem("selectedProject", project);

      try {
        if (!sessionId) {
          console.warn("⚠️ No session ID found. Cannot update project.");
          return;
        }

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
          toast.success(`✅ Project switched to ${project}`);

          // ✅ Prevent menu from opening on desktop
          if (isMobile) {
            toggleMenu();
          }
        }
      } catch (error) {
        console.error("❌ Project selection error:", error);
        toast.error("Failed to select project.");
      }
    },
    [backendUrl, sessionId, selectedProject, isMobile, toggleMenu]
  );

  return { selectedProject, selectProject };
};
