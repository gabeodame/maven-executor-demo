"use client";

import React, { useEffect, useState } from "react";
import Login from "./Login";
import RepoList from "./RepoList";
import { useSession, signOut } from "next-auth/react";
import ProjectList from "./ProjectList";
import { useMenu } from "../store/MenuContext";
import { useSessionCache } from "../store/SessionProvider";

function UserAccount() {
  const { data: session, status } = useSession();
  const { sessionId: cachedSessionId } = useSessionCache();
  const [isGithubUser, setIsGithubUser] = useState(false);
  const [isClient, setIsClient] = useState(false); // ✅ Prevent SSR mismatch
  const { isOpen, toggleMenu } = useMenu(); // ✅ Track menu open state

  const sessionId = session?.user?.id || cachedSessionId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!sessionId || typeof sessionId !== "string") {
      setIsGithubUser(false);
      return;
    }
    setIsGithubUser(!sessionId.startsWith("guest-"));
  }, [sessionId]);

  const handleSignOut = async () => {
    localStorage.removeItem("sessionId");
    if (isGithubUser) {
      await signOut({ callbackUrl: "/" });
    } else {
      window.location.reload();
    }
  };

  if (!isClient) return null; // ✅ Prevent hydration mismatch

  return (
    <div className="w-full flex flex-col gap-2 mb-6">
      <div className="flex w-full">
        {!sessionId ? (
          <Login />
        ) : (
          <button
            className="w-full px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 ease-in transition-all cursor-pointer"
            onClick={() => {
              handleSignOut();
              if (!isOpen) toggleMenu(); // ✅ Prevent unnecessary triggers
            }}
          >
            Sign Out
          </button>
        )}
      </div>
      <div className="w-full">
        {status === "authenticated" && (
          <div className="flex flex-col gap-1 w-full my-4">
            <div>
              <p>
                🎉 Welcome, <strong>{session.user?.name}</strong>! You&apos;re
                connected to GitHub.
              </p>
            </div>
            <RepoList />
          </div>
        )}

        <div className="mt-3 md:mt-6">{sessionId && <ProjectList />}</div>
      </div>
    </div>
  );
}

export default UserAccount;
