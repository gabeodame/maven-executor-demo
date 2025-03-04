"use client";
import { FaGithub } from "react-icons/fa";
import { useSession, signIn, signOut } from "next-auth/react";

export default function GithubIntegration() {
  const { data: session, status } = useSession(); // ✅ Use session in Client Component

  if (status === "loading") {
    return <p>Loading session...</p>; // ✅ Handle session loading state
  }

  return (
    <div>
      {session ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-center">
            Select a Java Application to run Maven lifecycle commands against
          </p>
          <p className="text-xs">
            Signed in as {session.user?.email ?? "Unknown"}
          </p>
          <button
            onClick={() => signOut()}
            className="w-fit flex items-center justify-center gap-2 cursor-pointer bg-gray-800 text-sm text-white px-4 py-2 rounded-md"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("github")}
          className="w-full flex flex-col items-center justify-center gap-2 cursor-pointer bg-cyan-800 hover:bg-cyan-900 ease-in transition-all text-white px-4 py-2 rounded-md"
        >
          <div className="flex items-center gap-1 text-nowrap text-sm">
            <span>Sign in with GitHub</span>
            <FaGithub />
          </div>
        </button>
      )}
    </div>
  );
}
