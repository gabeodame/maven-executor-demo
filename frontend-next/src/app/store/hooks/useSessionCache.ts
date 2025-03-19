import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  setGitHubUser,
  setSessionId,
  fetchGuestSessionThunk,
} from "../redux-toolkit/slices/sessionSlice";
import { useAppDispatch, useAppSelector } from "./hooks";

export const useSessionCache = () => {
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();
  const { sessionId, isGitHubUser, accessToken } = useAppSelector(
    (state) => state.session
  );

  // ✅ Sync GitHub User on Login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      console.log("✅ GitHub User Logged In:", session.user.id);
      dispatch(setGitHubUser(true));
      dispatch(setSessionId(session.user.id));
    }
  }, [session, status, dispatch]);

  // ❌ No automatic guest session fetching here!

  const fetchGuestSession = async () => {
    console.log("🚀 Fetching Guest Session...");
    await dispatch(fetchGuestSessionThunk()).unwrap();
  };

  return { sessionId, isGitHubUser, accessToken, fetchGuestSession };
};
