"use client";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { LuUserRoundMinus } from "react-icons/lu";
import { useSessionCache } from "../store/hooks/useSessionCache";

export default function Login() {
  const { fetchGuestSession } = useSessionCache();

  const handleSignIn = async (provider?: "github") => {
    if (provider === "github") {
      console.log("🔹 Signing in with GitHub...");
      await signIn("github");
      return;
    }

    console.log("🛠️ Handling Guest Session...");
    await fetchGuestSession();

    // ✅ Ensuring Redux updates before UI refresh
    setTimeout(() => {
      window.location.reload();
    }, 300);
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
