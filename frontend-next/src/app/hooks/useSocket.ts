import { useEffect, useState, useCallback, useRef } from "react";
import SocketService from "../services/SocketService";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAppDispatch } from "../store/hooks/hooks";
import {
  fetchProjects,
  selectProjectThunk,
  setProjects,
} from "../store/redux-toolkit/slices/projectSlice";
import {
  addMavenLog,
  clearMavenLogs,
  addCloneLog,
  clearCloneLogs,
} from "../store/redux-toolkit/slices/logSlice";
import { useSessionCache } from "../store/hooks/useSessionCache";

export const useSocket = () => {
  const { sessionId: cachedSessionId } = useSessionCache() || { sessionId: "" };
  const { data: session } = useSession();
  const sessionId = session?.user?.id || cachedSessionId;

  const dispatch = useAppDispatch();

  // ✅ Use refs to store persistent values across renders
  const socketServiceRef = useRef<SocketService | null>(null);
  const logBuffer = useRef<string[]>([]);
  const cloneLogBuffer = useRef<string[]>([]);
  const unsubscribeCloneLogsRef = useRef<(() => void) | null>(null);
  const logTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cloneLogTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [commandCompleted, setCommandCompleted] = useState(false);

  // ✅ Initialize WebSocket Connection
  useEffect(() => {
    if (!sessionId) {
      console.warn("⚠️ useSocket: No session ID! Skipping WebSocket.");
      return;
    }

    console.log("🔌 useSocket: Initializing WebSocket for session:", sessionId);
    const newSocketService = SocketService.getInstance(sessionId);
    socketServiceRef.current = newSocketService;
    setIsConnected(true);

    // ✅ Maven Logs Subscription (Efficient batching)
    const unsubscribeMavenLogs = newSocketService.subscribe(
      (newLogs, isLoading) => {
        logBuffer.current.push(...newLogs);

        if (!logTimeoutRef.current) {
          logTimeoutRef.current = setTimeout(() => {
            if (logBuffer.current.length > 0) {
              dispatch(addMavenLog(logBuffer.current.join("\n")));
              logBuffer.current = [];
            }
            logTimeoutRef.current = null;
          }, 300); // ✅ Reduce Redux updates with debounce
        }

        setLoading(isLoading);
        if (!isLoading) setCommandCompleted((prev) => !prev);
      }
    );

    // ✅ Clone Logs Subscription (Efficient batching)
    unsubscribeCloneLogsRef.current = newSocketService.subscribeCloneLogs(
      (newLogs) => {
        cloneLogBuffer.current.push(...newLogs);

        if (!cloneLogTimeoutRef.current) {
          cloneLogTimeoutRef.current = setTimeout(() => {
            if (cloneLogBuffer.current.length > 0) {
              dispatch(addCloneLog(cloneLogBuffer.current.join("\n")));
              cloneLogBuffer.current = [];
            }
            cloneLogTimeoutRef.current = null;
          }, 500); // ✅ Reduce Redux updates with debounce
        }
      }
    );

    // ✅ Clone Status Subscription
    const unsubscribeCloneStatus = newSocketService.subscribeCloneStatus(
      (status) => {
        console.log("📡 [Clone Status Update]", status);
        if (status.success) {
          toast.success("✅ Repository cloned successfully!");

          dispatch(fetchProjects(sessionId))
            .unwrap()
            .then((projects) => {
              if (projects.length > 0) {
                const latestProject = projects.at(-1);
                dispatch(
                  selectProjectThunk({ sessionId, project: latestProject! })
                );
              }
            })
            .catch((err) =>
              toast.error(`❌ Failed to fetch updated projects: ${err}`)
            );
        } else {
          toast.error(`❌ Clone failed: ${status.error}`);
        }
      }
    );

    // ✅ Handle Clear Clone Logs Event
    newSocketService.getSocket()?.on("clear-clone-logs", () => {
      console.log("🧹 Clearing clone logs...");
      dispatch(clearCloneLogs());
    });

    return () => {
      console.log(
        "🔌 useSocket: Cleaning up WebSocket for session:",
        sessionId
      );

      unsubscribeMavenLogs();
      unsubscribeCloneLogsRef.current?.(); // ✅ Cleanup clone logs subscription
      unsubscribeCloneStatus(); // ✅ Cleanup clone status subscription
      newSocketService.getSocket()?.off("clear-clone-logs"); // ✅ Cleanup event listener

      socketServiceRef.current = null;
      setIsConnected(false);
    };
  }, [sessionId, dispatch]);

  // ✅ Run Maven Commands (Pipeline & Normal)
  const runMavenCommand = useCallback(
    (cmd: string, type?: "pipeline" | "normal") => {
      const socketService = socketServiceRef.current;
      if (!socketService || !isConnected) {
        console.warn(
          "⚠️ useSocket: Cannot send command, WebSocket is not connected."
        );
        return;
      }

      console.log(`▶️ [CLIENT] Sending command: mvn ${cmd}`);

      if (loading) {
        console.warn(
          "⏳ Skipping duplicate command, previous command is still running."
        );
        return;
      }

      if (type === "pipeline" && socketService.isFirstPipelineRun()) {
        dispatch(clearMavenLogs());
        socketService.clearLogs();
        socketService.resetPipelineState();
      } else {
        dispatch(clearMavenLogs());
        dispatch(clearCloneLogs());
        socketService.clearLogs();
        socketService.clearCloneLogs();
        socketService.resetPipelineState();
      }

      setCommandCompleted(false);
      socketService.runMavenCommand(cmd, type);
    },
    [isConnected, loading, dispatch]
  );

  // ✅ Clone Repository via WebSocket
  const triggerClone = useCallback(
    async (
      repoUrl: string,
      branch: string,
      projectName?: string,
      repoPath?: string,
      pomPath?: string
    ): Promise<void> => {
      const socketService = socketServiceRef.current;
      if (!socketService || !isConnected) {
        console.warn(
          "⚠️ useSocket: Cannot send clone request, WebSocket is not connected."
        );
        return Promise.reject(new Error("WebSocket is not connected."));
      }

      console.log(`▶️ [CLIENT] Cloning: ${repoUrl} | Branch: ${branch}`);

      dispatch(clearCloneLogs()); // ✅ Clear logs before cloning
      dispatch(clearMavenLogs()); // ✅ Clear Maven logs as well

      return new Promise<void>((resolve, reject) => {
        let hasCompleted = false;

        const handleCloneStatus = (data: {
          success: boolean;
          repoPath?: string;
          error?: string;
        }) => {
          if (hasCompleted) return; // ✅ Prevent duplicate execution
          hasCompleted = true; // ✅ Ensure it runs only once

          if (data.success && data.repoPath) {
            console.log("🎉 Clone successful! Repo Path:", data.repoPath);

            if (sessionId) {
              console.log("🔄 Fetching updated projects...");
              dispatch(fetchProjects(sessionId))
                .unwrap()
                .then((updatedProjects) => {
                  dispatch(setProjects(updatedProjects));

                  const newProject = projectName || updatedProjects.at(-1);
                  if (newProject) {
                    dispatch(
                      selectProjectThunk({ sessionId, project: newProject })
                    );
                  }
                })
                .catch((err) => {
                  console.error("❌ Failed to fetch updated projects:", err);
                  toast.error(`❌ Failed to update project list: ${err}`);
                });
            }

            resolve();
          } else {
            console.error("❌ Clone failed!", data.error);
            toast.error(`❌ Clone failed: ${data.error}`);
            reject(new Error(data.error || "Unknown clone error"));
          }
        };

        // ✅ Unsubscribe from previous event listeners to prevent duplication
        unsubscribeCloneLogsRef.current?.();
        unsubscribeCloneLogsRef.current =
          socketService.subscribeCloneStatus(handleCloneStatus);

        // ✅ Emit the clone request
        socketService.triggerCloneRepo(
          repoUrl,
          branch,
          projectName,
          repoPath,
          pomPath
        );
      });
    },
    [isConnected, dispatch, sessionId]
  );

  return {
    loading,
    isConnected,
    runMavenCommand,
    triggerClone,
    commandCompleted,
  };
};
