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
          <h2 className="text-xl font-bold">GitHub Integration</h2>
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
          className="w-full flex items-center justify-center gap-2 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Sign in with GitHub <FaGithub />
        </button>
      )}
    </div>
  );
}
