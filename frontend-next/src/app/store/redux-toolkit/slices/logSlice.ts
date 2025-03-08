import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LogState {
  mavenLogs: string[];
  cloneLogs: string[];
}

const initialState: LogState = {
  mavenLogs: [], // ✅ Ensure initial logs are set
  cloneLogs: [],
};

const logSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    addMavenLog: (state, action: PayloadAction<string>) => {
      state.mavenLogs.push(action.payload);
    },
    clearMavenLogs: (state) => {
      state.mavenLogs = [];
    },
    addCloneLog: (state, action: PayloadAction<string>) => {
      state.cloneLogs.push(action.payload);
    },
    clearCloneLogs: (state) => {
      state.cloneLogs = [];
    },
    // resetLogsForGuest: (state) => {
    //   state.mavenLogs = [...initialLogs]; // ✅ Reset logs for guest users
    // },
  },
});

export const { addMavenLog, clearMavenLogs, addCloneLog, clearCloneLogs } =
  logSlice.actions;

export default logSlice.reducer;
