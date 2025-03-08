import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./redux-toolkit/store";

// ✅ Typed `useDispatch` hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// ✅ Typed `useSelector` hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
