import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useSessionCache } from "./useSessionCache";
import { getBackEndUrl } from "../util/getbackEndUrl";
import { useMenu } from "../store/MenuContext";

export const useSelectedProject = () => {
  const { sessionId } = useSessionCache(); // ✅ Get cached session ID
  const backendUrl = getBackEndUrl();
  const { toggleMenu } = useMenu();

  const [selectedProject, setSelectedProject] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem("selectedProject")
      : null
  );

  // ✅ Function to select a project and notify the backend
  const selectProject = useCallback(
    async (project: string) => {
      setSelectedProject(project);
      localStorage.setItem("selectedProject", project); // ✅ Persist selection

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
          toggleMenu();
        }
      } catch (error) {
        console.error("❌ Project selection error:", error);
        toast.error("Failed to select project.");
      }
    },
    [backendUrl, sessionId, toggleMenu]
  );

  return { selectedProject, selectProject };
};
