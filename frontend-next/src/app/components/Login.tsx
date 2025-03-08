"use client";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { LuUserRoundMinus } from "react-icons/lu";
import { useSessionCache } from "../store/react-context/SessionProvider";
// import { resetLogsForGuest } from "../store/redux-toolkit/slices/logSlice";
// import { useAppDispatch } from "../store/hooks";

export default function Login() {
  const { fetchGuestSession } = useSessionCache();
  // const dispatch = useAppDispatch();

  const handleSignIn = async (provider?: "github") => {
    if (provider === "github") {
      console.log("🔹 Signing in with GitHub...");
      await signIn("github");
      // dispatch(resetLogsForGuest());
      return;
    }

    console.log("🛠️ Handling Guest Session...");
    await fetchGuestSession();
    window.location.reload(); // ✅ Ensure UI updates correctly
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-cyan-700 px-6 py-3 rounded-md">
      <div className="w-full flex flex-col items-center gap-2">
        <button
          onClick={() => handleSignIn("github")}
          className="w-full flex flex-col items-center justify-center gap-2 cursor-pointer bg-cyan-800 hover:bg-cyan-900 ease-in transition-all text-white px-4 py-2 rounded-md"
        >
          <div className="flex items-center gap-1 text-nowrap text-sm">
            <span>Sign in with GitHub</span>
            <FaGithub />
          </div>
        </button>
        <button
          onClick={() => handleSignIn()}
          className="w-full flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-800 hover:bg-gray-900 ease-in transition-all text-white px-4 py-2 rounded-md"
        >
          <div className="flex items-center gap-1 text-nowrap text-sm">
            <span>Continue as Guest</span>
            <LuUserRoundMinus />
          </div>
        </button>
      </div>
    </div>
  );
}
