import { configureStore } from "@reduxjs/toolkit";
import logReducer from "./slices/logSlice";
import projectReducer from "./slices/projectSlice";
import artifactReducer from "./slices/artifactSlice";
import repoCloneStatusReducer from "./slices/repoCloneStatusSlice";

export const store = configureStore({
  reducer: {
    logs: logReducer,
    projects: projectReducer,
    artifacts: artifactReducer,
    repoCloneStatus: repoCloneStatusReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
