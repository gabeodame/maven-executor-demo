import { getBackEndUrl } from "@/app/util/getbackEndUrl";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface ProjectState {
  projects: string[];
  selectedProject: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
};

// ✅ Thunk to fetch projects
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (sessionId: string, { rejectWithValue }) => {
    const backendUrl = getBackEndUrl();

    if (!sessionId) {
      console.error("❌ fetchProjects failed: No session ID provided!");
      return rejectWithValue("Session ID missing");
    }

    console.log("📤 Fetching projects with sessionId:", sessionId);

    try {
      const response = await axios.get(`${backendUrl}/api/user-projects`, {
        headers: {
          "x-session-id": sessionId, // ✅ Explicitly send sessionId
        },
        withCredentials: true,
      });

      console.log("✅ Fetched projects successfully:", response.data);
      return response.data; // Expected: array of project names
    } catch (error: unknown) {
      console.error("❌ Error fetching projects:", error);

      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || "Failed to fetch projects"
        );
      }
      return rejectWithValue("Failed to fetch projects");
    }
  }
);

// ✅ Thunk to select a project
export const selectProjectThunk = createAsyncThunk(
  "projects/selectProject",
  async (
    { sessionId, project }: { sessionId: string; project: string },
    { rejectWithValue }
  ) => {
    const backendUrl = getBackEndUrl();

    if (!sessionId || !project.length) {
      console.warn("❌ Missing sessionId or project in selectProjectThunk");
      return rejectWithValue("Missing session ID or project name");
    }

    console.log(
      `📤 Selecting project: ${project} with sessionId: ${sessionId}`
    );

    try {
      const response = await axios.post(
        `${backendUrl}/api/select-project`,
        { project }, // ✅ Corrected payload
        {
          headers: { "x-session-id": sessionId }, // ✅ Ensure session ID is passed
          withCredentials: true,
        }
      );

      console.log("✅ Project selected:", response.data);
      return project; // ✅ Return selected project
    } catch (error: unknown) {
      console.error("❌ Error selecting project:", error);

      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || "Failed to select project"
        );
      }
      return rejectWithValue("Failed to select project");
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    // Sync action to manually set projects (useful in testing/debugging)
    setProjects: (state, action: PayloadAction<string[]>) => {
      state.projects = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Handle fetchProjects states
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.loading = false;
          state.projects = action.payload;
        }
      )
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Handle selectProject states
      .addCase(selectProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        selectProjectThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.selectedProject = action.payload;
        }
      )
      .addCase(selectProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProjects } = projectSlice.actions;
export default projectSlice.reducer;
