import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProjectState {
  projects: string[];
  selectedProject: string | null;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<string[]>) => {
      state.projects = action.payload;
    },
    selectProject: (state, action: PayloadAction<string>) => {
      state.selectedProject = action.payload;
    },
  },
});

export const { setProjects, selectProject } = projectSlice.actions;

export default projectSlice.reducer;
