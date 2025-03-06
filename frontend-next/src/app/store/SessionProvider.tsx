"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getBackEndUrl } from "../util/getbackEndUrl";
import { useMenu } from "./MenuContext"; // ✅ Ensure correct import path
import { useIsMobile } from "../hooks/useIsMobile";

const SESSION_STORAGE_KEY = "sessionId";
const PROJECT_STORAGE_KEY = "selectedProject";

interface SessionContextType {
  sessionId: string | null;
  selectedProject: string | null;
  projects: string[];
  fetchGuestSession: () => Promise<void>;
  selectProject: (project: string) => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session, status } = useSession();
  const backendUrl = getBackEndUrl();
  const { toggleMenu } = useMenu(); // ✅ Will work now that MenuProvider comes first
  const isMobile = useIsMobile();

  const [sessionId, setSessionId] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(SESSION_STORAGE_KEY)
      : null
  );

  const [selectedProject, setSelectedProject] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(PROJECT_STORAGE_KEY)
      : null
  );

  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      console.log("🔄 Updating stored session to:", session.user.id);
      localStorage.setItem(SESSION_STORAGE_KEY, session.user.id);
      setSessionId(session.user.id);
    }
  }, [session, status]);

  const fetchGuestSession = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/get-session`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to fetch session ID");

      const data = await res.json();
      console.log("✅ Guest session created:", data.sessionId);
      localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
      setSessionId(data.sessionId);
    } catch (error) {
      console.error("❌ Error fetching session ID:", error);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/user-projects`, {
          method: "GET",
          headers: { "x-session-id": sessionId },
        });

        const fetchedProjects = await response.json();
        if (!response.ok) throw new Error("Failed to fetch projects");

        if (Array.isArray(fetchedProjects) && fetchedProjects.length > 0) {
          setProjects(fetchedProjects);

          if (!selectedProject || !fetchedProjects.includes(selectedProject)) {
            setSelectedProject(fetchedProjects[0]);
            localStorage.setItem(PROJECT_STORAGE_KEY, fetchedProjects[0]);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [sessionId, backendUrl]);

  const selectProject = useCallback(
    async (project: string) => {
      if (!project || project === selectedProject) return;

      setSelectedProject(project);
      localStorage.setItem(PROJECT_STORAGE_KEY, project);

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
          if (isMobile) toggleMenu();
        }
      } catch (error) {
        console.error("❌ Project selection error:", error);
        toast.error("Failed to select project.");
      }
    },
    [backendUrl, sessionId, toggleMenu, isMobile, selectedProject]
  );

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        selectedProject,
        projects,
        fetchGuestSession,
        selectProject,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionCache = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionCache must be used within a SessionProvider");
  }
  return context;
};
