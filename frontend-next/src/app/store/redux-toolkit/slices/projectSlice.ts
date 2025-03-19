import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getBackEndUrl } from "@/app/util/getbackEndUrl";
import axios, { AxiosError } from "axios";
import { RootState, AppDispatch } from "../store";
import SocketService from "@/app/services/SocketService"; // ✅ Correct import

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
}

// ✅ Initial State
const initialState: ProjectState = {
  projects: [],
  selectedProject: null, // ✅ Avoid accessing localStorage (SSR-safe)
  loading: false,
  error: null,
};

// ✅ Fetch Projects from Backend
export const fetchProjects = createAsyncThunk<
  string[], // ✅ Return Type
  string, // ✅ Argument Type (sessionId)
  { rejectValue: string }
>("projects/fetchProjects", async (sessionId, { rejectWithValue }) => {
  if (!sessionId) return rejectWithValue("Session ID missing");

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
});

// ✅ Select Project (Updates Backend & Local State)
export const selectProjectThunk = createAsyncThunk<
  string, // ✅ Return Type (project name)
  { sessionId: string; project: string }, // ✅ Argument Type
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

      localStorage.setItem("selectedProject", project); // ✅ Ensure local persistence
      return project;
    } catch (error) {
      console.error("❌ Error selecting project:", error);
      return rejectWithValue("Failed to select project");
    }
  }
);

// ✅ Delete Project
export const deleteProjectThunk = createAsyncThunk<
  string, // ✅ Return Type (deleted project name)
  { sessionId: string; project: string }, // ✅ Argument Type
  { rejectValue: string } // ✅ Reject must return a string to match `state.error`
>(
  "projects/deleteProject",
  async ({ sessionId, project }, { rejectWithValue }) => {
    try {
      const response = await axios.delete<DeleteProjectResponse>(
        `${getBackEndUrl()}/api/delete-project`,
        {
          data: { projectName: project }, // ✅ Backend expects `projectName`
          headers: { "x-session-id": sessionId },
        }
      );

      if (response.data.success) {
        console.log(`🗑️ Project deleted successfully: ${project}`);
        return project;
      } else {
        return rejectWithValue(response.data.message || "Unknown error");
      }
    } catch (error: unknown) {
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

  const socketService = SocketService.getInstance(sessionId); // ✅ Ensure correct instance

  socketService.subscribeCloneStatus(
    async (data: { success: boolean; repoPath?: string; error?: string }) => {
      if (data.success && data.repoPath) {
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
      } else {
        console.error("❌ Clone failed:", data.error);
      }
    }
  );
};

// ✅ Redux Slice Definition
const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<string[]>) => {
      state.projects = action.payload;

      // ✅ Preserve user selection if already set
      if (!state.selectedProject && action.payload.length > 0) {
        state.selectedProject = action.payload[0];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        if (!state.selectedProject && action.payload.length > 0) {
          state.selectedProject = action.payload[0];
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      })

      // ✅ Select Project
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

      // ✅ Delete Project
      // ✅ Delete Project
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
