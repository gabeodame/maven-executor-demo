import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getBackEndUrl } from "@/app/util/getbackEndUrl";
import axios, { AxiosError } from "axios";
import { RootState, AppDispatch } from "../store";
import SocketService from "@/app/services/SocketService";

// ✅ Interface for Delete Response
interface DeleteProjectResponse {
  success: boolean;
  message?: string;
}

// ✅ Interface for Error Handling
interface DeleteProjectError {
  error: string;
  statusCode: number;
}

// ✅ Define Project State
interface ProjectState {
  projects: string[];
  selectedProject: string | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number; // ✅ Prevent redundant fetches
}

// ✅ Initial State
const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  lastUpdated: 0,
};

// ✅ Fetch Projects (Prevent redundant API calls)
export const fetchProjects = createAsyncThunk<
  string[],
  string,
  { state: RootState; rejectValue: string }
>(
  "projects/fetchProjects",
  async (sessionId, { getState, rejectWithValue }) => {
    if (!sessionId) return rejectWithValue("Session ID missing");

    const state = getState().projects;
    const now = Date.now();

    if (now - state.lastUpdated < 5000) {
      console.warn("⏳ Skipping duplicate fetchProjects call...");
      return state.projects;
    }

    try {
      const response = await axios.get<string[]>(
        `${getBackEndUrl()}/api/user-projects`,
        {
          headers: { "x-session-id": sessionId },
          withCredentials: true,
        }
      );
      console.log("✅ Fetched projects:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      return rejectWithValue("Failed to fetch projects");
    }
  }
);

// ✅ Select Project
export const selectProjectThunk = createAsyncThunk<
  string,
  { sessionId: string; project: string },
  { rejectValue: string }
>(
  "projects/selectProject",
  async ({ sessionId, project }, { rejectWithValue }) => {
    try {
      await axios.post(
        `${getBackEndUrl()}/api/select-project`,
        { project },
        {
          headers: { "x-session-id": sessionId },
          withCredentials: true,
        }
      );
      localStorage.setItem("selectedProject", project);
      return project;
    } catch (error) {
      console.warn("❌ Error selecting project:", error);
      return rejectWithValue("Failed to select project");
    }
  }
);

// ✅ Delete Project
export const deleteProjectThunk = createAsyncThunk<
  string,
  { sessionId: string; project: string },
  { rejectValue: string }
>(
  "projects/deleteProject",
  async ({ sessionId, project }, { rejectWithValue }) => {
    try {
      const response = await axios.delete<DeleteProjectResponse>(
        `${getBackEndUrl()}/api/delete-project`,
        {
          data: { projectName: project },
          headers: { "x-session-id": sessionId },
        }
      );
      if (response.data.success) {
        console.log(`🗑️ Project deleted successfully: ${project}`);
        return project;
      } else {
        return rejectWithValue(response.data.message || "Unknown error");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<DeleteProjectError>;
        return rejectWithValue(
          axiosError.response?.data?.error || "Failed to delete project."
        );
      }
      return rejectWithValue("An unexpected error occurred.");
    }
  }
);

// ✅ Handle Clone Completion via WebSocket
export const handleCloneCompletion = (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  const sessionId = getState().session.sessionId;
  if (!sessionId) return;

  const socketService = SocketService.getInstance(sessionId);
  socketService.getSocket()?.off("repo-clone-status"); // Cleanup previous listener

  socketService.subscribeCloneStatus(
    async (data: { success: boolean; repoPath?: string; error?: string }) => {
      if (!data.success) {
        console.error("❌ Clone failed:", data.error);
        return; // ✅ Exit early if the clone process failed
      }

      if (!data.repoPath) {
        console.warn("⚠️ Clone success but no valid repo path received.");
        return;
      }

      console.log("✅ Clone success. Repo Path:", data.repoPath);

      dispatch(fetchProjects(sessionId))
        .unwrap()
        .then((updatedProjects: string[]) => {
          const newProject = updatedProjects.find((p) =>
            data.repoPath?.includes(p)
          );
          if (newProject) {
            dispatch(selectProjectThunk({ sessionId, project: newProject }));
          }
        })
        .catch((fetchError) => {
          console.error("❌ Error fetching updated projects:", fetchError);
        });
    }
  );
};

// ✅ Redux Slice Definition
const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<string[]>) => {
      if (JSON.stringify(state.projects) !== JSON.stringify(action.payload)) {
        state.projects = [...action.payload];
        state.lastUpdated = Date.now();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.lastUpdated = Date.now();
        if (!state.selectedProject && action.payload.length > 0) {
          state.selectedProject = action.payload[0];
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(selectProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
      })
      .addCase(selectProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(deleteProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p !== action.payload);
        if (state.selectedProject === action.payload) {
          state.selectedProject =
            state.projects.length > 0 ? state.projects[0] : null;
        }
      })
      .addCase(deleteProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete project.";
      });
  },
});

export const { setProjects } = projectSlice.actions;
export default projectSlice.reducer;
