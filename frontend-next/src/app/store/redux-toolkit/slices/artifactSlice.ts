import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getBackEndUrl } from "../../../util/getbackEndUrl";

export interface Artifact {
  name: string;
  path: string;
  size?: number;
  type: "file" | "directory";
  modifiedAt?: string;
  children?: Artifact[];
}

interface ArtifactState {
  artifacts: Artifact[];
  expandedDirs: Record<string, Artifact[]>;
  loading: boolean;
  error: string | null;
}

const initialState: ArtifactState = {
  artifacts: [],
  expandedDirs: {},
  loading: false,
  error: null,
};

// ✅ Fetch project-level artifacts
export const fetchArtifactsFromApi = createAsyncThunk(
  "artifacts/fetchArtifacts",
  async (
    {
      sessionId,
      selectedProject,
    }: { sessionId: string; selectedProject: string },
    { rejectWithValue }
  ) => {
    try {
      const backendUrl = getBackEndUrl();
      const res = await fetch(
        `${backendUrl}/api/artifacts?project=${encodeURIComponent(
          selectedProject
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Server Error: ${res.status}`);
      }

      const data = await res.json();
      return data[selectedProject] || [];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// ✅ Fetch subdirectory artifacts
export const fetchSubArtifactsFromApi = createAsyncThunk(
  "artifacts/fetchSubArtifacts",
  async (
    { sessionId, dirPath }: { sessionId: string; dirPath: string },
    { rejectWithValue }
  ) => {
    try {
      const backendUrl = getBackEndUrl();
      const res = await fetch(
        `${backendUrl}/api/artifacts?path=${encodeURIComponent(dirPath)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "x-session-id": sessionId,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Server Error: ${res.status}`);
      }

      const data: Artifact[] = await res.json();
      return { dirPath, data };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

const artifactSlice = createSlice({
  name: "artifacts",
  initialState,
  reducers: {
    clearArtifacts: (state) => {
      state.artifacts = [];
      state.expandedDirs = {};
    },
    collapseDir: (state, action: PayloadAction<string>) => {
      delete state.expandedDirs[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtifactsFromApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtifactsFromApi.fulfilled, (state, action) => {
        state.loading = false;
        state.artifacts = action.payload;
      })
      .addCase(fetchArtifactsFromApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSubArtifactsFromApi.fulfilled, (state, action) => {
        state.expandedDirs[action.payload.dirPath] = action.payload.data;
      })
      .addCase(fetchSubArtifactsFromApi.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearArtifacts, collapseDir } = artifactSlice.actions;
export default artifactSlice.reducer;
