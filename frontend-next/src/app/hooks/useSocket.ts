import { useEffect, useState, useCallback } from "react";
import SocketService from "../services/SocketService";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import {
  fetchProjects,
  selectProjectThunk,
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
  const { cloneLogs, mavenLogs } = useAppSelector((state) => state.logs);

  const [socketService, setSocketService] = useState<SocketService | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [commandCompleted, setCommandCompleted] = useState(false);
  const [unsubscribeCloneLogs, setUnsubscribeCloneLogs] = useState<
    (() => void) | null
  >(null);

  // ✅ Initialize WebSocket Connection
  useEffect(() => {
    if (!sessionId) {
      console.warn("⚠️ useSocket: No session ID! Skipping WebSocket.");
      return;
    }

    console.log("🔌 useSocket: Initializing WebSocket for session:", sessionId);
    const newSocketService = SocketService.getInstance(sessionId);
    setSocketService(newSocketService);
    setIsConnected(true);

    // ✅ Subscribe to Maven logs
    const unsubscribeMaven = newSocketService.subscribe(
      (newLogs, isLoading) => {
        newLogs.forEach((log) => dispatch(addMavenLog(log)));
        setLoading(isLoading);
        if (!isLoading) setCommandCompleted((prev) => !prev);
      }
    );

    // ✅ Subscribe to Clone logs (only once)
    const unsubscribeClone = newSocketService.subscribeCloneLogs((newLogs) => {
      newLogs.forEach((log) => dispatch(addCloneLog(log)));
    });

    setUnsubscribeCloneLogs(() => unsubscribeClone);

    // ✅ Listen for Clone Completion
    const unsubscribeCloneStatus = newSocketService.subscribeCloneStatus(
      (status) => {
        console.log("📡 [Clone Status Update]", status);

        if (status.success) {
          toast.success("✅ Repository cloned successfully!");

          // ✅ Fetch updated projects and select the newly cloned one
          dispatch(fetchProjects(sessionId))
            .unwrap()
            .then((projects) => {
              if (projects.length > 0) {
                const latestProject = projects[projects.length - 1]; // ✅ Select last project (newly cloned)
                dispatch(
                  selectProjectThunk({ sessionId, project: latestProject })
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
      unsubscribeMaven();
      unsubscribeClone();
      unsubscribeCloneStatus();
      newSocketService.getSocket()?.off("clear-clone-logs"); // ✅ Cleanup event listener
      setSocketService(null);
      setIsConnected(false);
    };
  }, [sessionId, dispatch]);

  // ✅ Run Maven Commands (Pipeline & Normal)
  const runMavenCommand = useCallback(
    (cmd: string, type?: "pipeline" | "normal") => {
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

      if (type === "pipeline") {
        if (socketService.isFirstPipelineRun()) {
          dispatch(clearMavenLogs());
          socketService.clearLogs();
          socketService.resetPipelineState();
        }
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
    [socketService, isConnected, loading, dispatch]
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
      if (!socketService || !isConnected) {
        console.warn(
          "⚠️ useSocket: Cannot send clone request, WebSocket is not connected."
        );
        return Promise.reject(new Error("WebSocket is not connected."));
      }

      console.log(`▶️ [CLIENT] Cloning: ${repoUrl} | Branch: ${branch}`);

      dispatch(clearCloneLogs()); // ✅ Ensure logs are cleared before cloning starts
      dispatch(clearMavenLogs()); // ✅ Clear Maven logs as well
      return new Promise<void>((resolve, reject) => {
        let hasCompleted = false;

        const handleCloneLog = (log: string) => {
          console.log("📡 [Clone Log]", log);
          dispatch(addCloneLog(log));

          if (!hasCompleted) {
            if (log.includes("✅ Repository cloned successfully")) {
              console.log("🎉 Clone successful!");
              hasCompleted = true;
              resolve();
            } else if (log.includes("❌ ERROR")) {
              console.error("❌ Clone failed!", log);
              hasCompleted = true;
              reject(new Error(log));
            }
          }
        };

        if (unsubscribeCloneLogs) {
          unsubscribeCloneLogs();
        }

        const unsubscribe = socketService.subscribeCloneLogs((newLogs) => {
          newLogs.forEach(handleCloneLog);
        });

        setUnsubscribeCloneLogs(() => unsubscribe);

        socketService.triggerCloneRepo(
          repoUrl,
          branch,
          projectName,
          repoPath,
          pomPath
        );

        setTimeout(() => {
          if (!hasCompleted) {
            console.warn("⏳ Clone operation timed out.");
          }
        }, 30000);
      });
    },
    [socketService, isConnected, dispatch, unsubscribeCloneLogs]
  );

  return {
    mavenLogs,
    cloneLogs,
    loading,
    isConnected,
    runMavenCommand,
    triggerClone,
    commandCompleted,
  };
};
