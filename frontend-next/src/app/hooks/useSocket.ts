import { useEffect, useState } from "react";
import SocketService from "../services/SocketService";
import { useSession } from "next-auth/react";
import { useSessionCache } from "../store/react-context/SessionProvider";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../store/hooks";
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

export const useSocket = () => {
  const { sessionId: cachedSessionId } = useSessionCache() || { sessionId: "" };
  const { data: session } = useSession();
  const sessionId = session?.user?.id || cachedSessionId;

  const dispatch = useAppDispatch();
  const { success } = useAppSelector((state) => state.repoCloneStatus);
  const { cloneLogs, mavenLogs } = useAppSelector((state) => state.logs);

  const [socketService, setSocketService] = useState<SocketService | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [commandCompleted, setCommandCompleted] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState<boolean | null>(null);
  const [unsubscribeCloneLogs, setUnsubscribeCloneLogs] = useState<
    (() => void) | null
  >(null);

  useEffect(() => {
    if (!sessionId || sessionId.trim() === "") {
      console.warn(
        "⚠️ useSocket: No session ID available! Skipping WebSocket."
      );
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

    setUnsubscribeCloneLogs(() => unsubscribeClone); // ✅ Store unsubscribe function

    // ✅ Listen for Clone Completion
    const unsubscribeCloneStatus = newSocketService.subscribeCloneStatus(
      (status) => {
        console.log("📡 [Clone Status Update]", status);
        setCloneSuccess(status.success);

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
              toast.error(`Failed to fetch updated projects: ${err}`)
            );
        } else {
          toast.error(`❌ Clone failed: ${status.error}`);
        }
      }
    );

    return () => {
      console.log(
        "🔌 useSocket: Cleaning up WebSocket for session:",
        sessionId
      );
      unsubscribeMaven();
      unsubscribeClone();
      unsubscribeCloneStatus();
      setSocketService(null);
      setIsConnected(false);
    };
  }, [sessionId, success, dispatch]); // ✅ Runs when `success` updates

  // ✅ Run Maven Commands (Pipeline & Normal)
  const runMavenCommand = (cmd: string, type?: "pipeline" | "normal") => {
    if (!socketService || !isConnected) {
      console.warn(
        "⚠️ useSocket: Cannot send command, WebSocket is not connected."
      );
      return;
    }

    console.log(
      `▶️ [CLIENT] Sending command: mvn ${cmd} | Session ID: ${sessionId}`
    );

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
  };

  // ✅ Clone Repository via WebSocket
  const triggerClone = async (
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

    console.log(
      `▶️ [CLIENT] Triggering repository clone: ${repoUrl} | Branch: ${branch}`
    );

    dispatch(clearCloneLogs()); // ✅ Clear previous logs before starting

    return new Promise<void>((resolve, reject) => {
      let hasCompleted = false;

      const handleCloneLog = (log: string) => {
        console.log("📡 [Clone Log]", log);
        dispatch(addCloneLog(log));

        if (!hasCompleted) {
          if (log.includes("✅ Repository cloned successfully")) {
            console.log("🎉 Clone operation successful!");
            hasCompleted = true;
            resolve();
          } else if (log.includes("❌ ERROR")) {
            console.error("❌ Clone operation failed!", log);
            hasCompleted = true;
            reject(new Error(log));
          }
        }
      };

      // ✅ Unsubscribe from previous logs to prevent duplicate messages
      if (unsubscribeCloneLogs) {
        unsubscribeCloneLogs();
      }

      // ✅ Subscribe to new logs & capture unsubscribe function
      const unsubscribe = socketService.subscribeCloneLogs((newLogs) => {
        newLogs.forEach(handleCloneLog);
      });

      setUnsubscribeCloneLogs(() => unsubscribe); // ✅ Store unsubscribe function

      // ✅ Send WebSocket request
      socketService.triggerCloneRepo(
        repoUrl,
        branch,
        projectName,
        repoPath,
        pomPath
      );

      // ✅ Timeout if clone does not complete in 30s
      setTimeout(() => {
        if (!hasCompleted) {
          console.warn("⏳ Clone operation timed out.");
        }
      }, 30000);
    });
  };

  return {
    mavenLogs,
    cloneLogs,
    loading,
    isConnected,
    runMavenCommand,
    triggerClone,
    cloneSuccess,
    commandCompleted,
  };
};
