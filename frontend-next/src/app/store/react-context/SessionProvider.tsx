// "use client";

// import {
//   createContext,
//   useState,
//   useEffect,
//   useCallback,
//   useContext,
// } from "react";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import { getBackEndUrl } from "../../util/getbackEndUrl";
// import { useAppDispatch } from "@/app/store/hooks/hooks";
// import { selectProjectThunk } from "@/app/store/redux-toolkit/slices/projectSlice";

// const SESSION_STORAGE_KEY = "sessionId";
// const PROJECT_STORAGE_KEY = "selectedProject";

// interface SessionContextType {
//   sessionId: string | null;
//   isGitHubUser: boolean;
//   selectedProject: string | null;
//   projects: string[];
//   accessToken: string | null;
//   fetchGuestSession: () => Promise<void>; // ✅ Explicit call for guest sessions
//   selectProject: (project: string) => Promise<void>;
// }

// export const SessionContext = createContext<SessionContextType | undefined>(
//   undefined
// );

// export const SessionProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const { data: session, status } = useSession();
//   const backendUrl = getBackEndUrl();
//   const dispatch = useAppDispatch();

//   const [sessionId, setSessionId] = useState<string | null>(() =>
//     typeof window !== "undefined"
//       ? localStorage.getItem(SESSION_STORAGE_KEY)
//       : null
//   );

//   const [selectedProject, setSelectedProject] = useState<string | null>(() =>
//     typeof window !== "undefined"
//       ? localStorage.getItem(PROJECT_STORAGE_KEY)
//       : null
//   );

//   const [projects, setProjects] = useState<string[]>([]);
//   const [isGitHubUser, setIsGitHubUser] = useState(false);
//   const [accessToken, setAccessToken] = useState<string | null>(null);

//   // ✅ Store accessToken in state for consistent rendering
//   useEffect(() => {
//     if (session?.accessToken) {
//       setAccessToken(session.accessToken);
//     }
//   }, [session]);

//   // ✅ Sync session on login (GitHub users)
//   useEffect(() => {
//     if (status === "authenticated" && session?.user?.id) {
//       setIsGitHubUser(true);
//       localStorage.setItem(SESSION_STORAGE_KEY, session.user.id);
//       setSessionId(session.user.id);
//     }
//   }, [session, status]);

//   // ✅ Fetch a guest session only when explicitly requested
//   const fetchGuestSession = async () => {
//     try {
//       const res = await fetch(`${backendUrl}/api/get-session`, {
//         method: "POST",
//       });
//       if (!res.ok) throw new Error("Failed to fetch session ID");

//       const data = await res.json();
//       localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
//       setSessionId(data.sessionId);
//     } catch (error) {
//       console.error("❌ Error fetching session ID:", error);
//     }
//   };

//   // ❌ Removed automatic guest session fetching to maintain session continuity

//   // ✅ Fetch projects & restore cached project
//   useEffect(() => {
//     if (!sessionId) return;

//     const fetchProjects = async () => {
//       try {
//         const response = await fetch(`${backendUrl}/api/user-projects`, {
//           method: "GET",
//           headers: { "x-session-id": sessionId },
//         });

//         const fetchedProjects = await response.json();
//         if (!response.ok) throw new Error("Failed to fetch projects");

//         if (Array.isArray(fetchedProjects) && fetchedProjects.length > 0) {
//           setProjects(fetchedProjects);

//           // ✅ Restore cached project or default to first
//           const cachedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
//           if (cachedProject && fetchedProjects.includes(cachedProject)) {
//             setSelectedProject(cachedProject);
//           } else {
//             setSelectedProject(fetchedProjects[0]);
//             localStorage.setItem(PROJECT_STORAGE_KEY, fetchedProjects[0]);
//           }
//         }
//       } catch (error) {
//         console.error("❌ Error fetching projects:", error);
//       }
//     };

//     fetchProjects();
//   }, [sessionId, backendUrl]);

//   // ✅ Select project and update Redux state
//   const selectProject = useCallback(
//     async (project: string) => {
//       if (!project || project === selectedProject) return;

//       setSelectedProject(project);
//       localStorage.setItem(PROJECT_STORAGE_KEY, project);

//       try {
//         const response = await fetch(`${backendUrl}/api/select-project`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             ...(sessionId && { "x-session-id": sessionId }),
//           },
//           body: JSON.stringify({ projectName: project }),
//         });

//         if (!response.ok) {
//           toast.error("Failed to select project.");
//         } else {
//           toast.success(`✅ Project switched to ${project}`);
//           if (sessionId) {
//             dispatch(selectProjectThunk({ sessionId, project }));
//           } else {
//             toast.error("Session ID is missing.");
//           }
//         }
//       } catch (error) {
//         console.error("❌ Project selection error:", error);
//         toast.error("Failed to select project.");
//       }
//     },
//     [backendUrl, sessionId, selectedProject, dispatch]
//   );

//   return (
//     <SessionContext.Provider
//       value={{
//         sessionId,
//         selectedProject,
//         projects,
//         fetchGuestSession, // ✅ User must call this manually to get a guest session
//         selectProject,
//         isGitHubUser,
//         accessToken,
//       }}
//     >
//       {children}
//     </SessionContext.Provider>
//   );
// };

// export const useSessionCache = () => {
//   const context = useContext(SessionContext);
//   if (!context) {
//     throw new Error("useSessionCache must be used within a SessionProvider");
//   }
//   return context;
// };
