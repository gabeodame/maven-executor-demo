import { configureStore } from "@reduxjs/toolkit";
import logReducer from "./slices/logSlice";
import projectReducer from "./slices/projectSlice";
import artifactReducer from "./slices/artifactSlice";
import repoCloneStatusReducer from "./slices/repoCloneStatusSlice";
import sessionReducer from "./slices/sessionSlice";
import menuReducer from "./slices/menuSlice";
import modalReducer from "./slices/modalSlice";

export const store = configureStore({
  reducer: {
    logs: logReducer,
    projects: projectReducer,
    artifacts: artifactReducer,
    repoCloneStatus: repoCloneStatusReducer,
    session: sessionReducer,
    menu: menuReducer,
    modal: modalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
