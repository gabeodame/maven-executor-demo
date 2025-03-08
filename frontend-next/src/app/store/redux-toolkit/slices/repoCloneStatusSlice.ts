import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RepoCloneStatusState {
  isCloning: boolean;
  success: boolean | null;
  error: string | null;
}

const initialState: RepoCloneStatusState = {
  isCloning: false,
  success: null,
  error: null,
};

const repoCloneStatusSlice = createSlice({
  name: "repoCloneStatus",
  initialState,
  reducers: {
    startCloning: (state) => {
      state.isCloning = true;
      state.success = null;
      state.error = null;
    },
    cloneSuccess: (state) => {
      state.isCloning = false;
      state.success = true;
      state.error = null;
    },
    cloneFailure: (state, action: PayloadAction<string>) => {
      state.isCloning = false;
      state.success = false;
      state.error = action.payload;
    },
    resetCloneStatus: (state) => {
      state.isCloning = false;
      state.success = null;
      state.error = null;
    },
  },
});

export const { startCloning, cloneSuccess, cloneFailure, resetCloneStatus } =
  repoCloneStatusSlice.actions;

export default repoCloneStatusSlice.reducer;
