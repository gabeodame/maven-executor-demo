import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { toast } from "sonner";
import { SessionContext } from "../store/react-context/SessionProvider"; // ✅ Import SessionContext
import { getBackEndUrl } from "../util/getbackEndUrl";
import { useMenu } from "../store/react-context/MenuContext";
import { useIsMobile } from "./useIsMobile";

export const useSelectedProject = () => {
  // ✅ Ensure context is always available
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSelectedProject must be used within a SessionProvider");
  }

  const {
    sessionId,
    selectedProject: contextProject,
    selectProject: setSessionProject,
  } = context; // ✅ Extract from context

  const backendUrl = getBackEndUrl();
  const { toggleMenu } = useMenu();
  const isMobile = useIsMobile();

  const [selectedProject, setSelectedProject] = useState<string | null>(
    contextProject
  );
  const hasUserSelected = useRef(false); // ✅ Track if user manually selected a project

  // ✅ Sync local state with context state
  useEffect(() => {
    if (contextProject !== selectedProject) {
      setSelectedProject(contextProject);
    }
  }, [contextProject, selectedProject]);

  // ✅ Load selected project from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProject = localStorage.getItem("selectedProject");
      if (storedProject) {
        setSelectedProject(storedProject);
        setSessionProject(storedProject); // ✅ Update SessionContext
      }
    }
  }, [setSessionProject]);

  // ✅ Function to select a project and update the global session context
  const selectProject = useCallback(
    async (project: string) => {
      if (!project || project === selectedProject) return;

      setSelectedProject(project);
      setSessionProject(project); // ✅ Update context
      localStorage.setItem("selectedProject", project);

      // ✅ Prevent triggering toast if restoring from cache
      if (!hasUserSelected.current) {
        console.log("🔄 Restoring cached project:", project);
        return;
      }

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
    [
      backendUrl,
      sessionId,
      selectedProject,
      setSessionProject,
      isMobile,
      toggleMenu,
    ]
  );

  return { selectedProject, selectProject, hasUserSelected };
};
