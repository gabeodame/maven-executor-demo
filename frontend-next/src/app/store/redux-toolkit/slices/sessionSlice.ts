import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getBackEndUrl } from "@/app/util/getbackEndUrl";

const SESSION_STORAGE_KEY = "sessionId";

interface SessionState {
  sessionId: string | null;
  isGitHubUser: boolean;
  accessToken: string | null;
}

const initialState: SessionState = {
  sessionId:
    typeof window !== "undefined"
      ? localStorage.getItem(SESSION_STORAGE_KEY)
      : null,
  isGitHubUser: false,
  accessToken: null,
};

// ✅ Fetch Guest Session from Backend
export const fetchGuestSessionThunk = createAsyncThunk<
  string, // Return type (session ID)
  void, // No arguments
  { rejectValue: string }
>("session/fetchGuestSession", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.post<{ sessionId: string }>(
      `${getBackEndUrl()}/api/get-session`
    );

    console.log("✅ New Guest Session:", response.data.sessionId);

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, response.data.sessionId);
    }

    return response.data.sessionId;
  } catch (error) {
    console.error("❌ Error fetching guest session:", error);
    return rejectWithValue("Failed to fetch guest session.");
  }
});

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    // ✅ Set session ID manually (for GitHub login)
    setSessionId: (state, action: PayloadAction<string | null>) => {
      state.sessionId = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_STORAGE_KEY, action.payload || "");
      }
    },

    // ✅ Set GitHub user state (used during login)
    setGitHubUser: (state, action: PayloadAction<boolean>) => {
      state.isGitHubUser = action.payload;
    },

    // ✅ Store access token (for authenticated users)
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGuestSessionThunk.fulfilled, (state, action) => {
      state.sessionId = action.payload;
      state.isGitHubUser = false; // Ensure it's treated as a guest session
    });
  },
});

export const { setSessionId, setGitHubUser, setAccessToken } =
  sessionSlice.actions;
export default sessionSlice.reducer;
