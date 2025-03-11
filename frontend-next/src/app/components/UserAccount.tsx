"use client";

import React, { useEffect, useState } from "react";
import Login from "./Login";

import { useSession, signOut } from "next-auth/react";
import ProjectList from "./ProjectList";
import { useMenu } from "../store/react-context/MenuContext";
import { useSessionCache } from "../store/react-context/SessionProvider";
import { useAppDispatch } from "../store/hooks";
import { addMavenLog } from "../store/redux-toolkit/slices/logSlice";
import RepoList from "./RepoList";

function UserAccount() {
  const { data: session, status } = useSession();
  const { sessionId: cachedSessionId, isGitHubUser } = useSessionCache();
  const [isClient, setIsClient] = useState(false); // ✅ Prevent SSR mismatch
  const { isOpen, toggleMenu } = useMenu(); // ✅ Track menu open state
  const dispatch = useAppDispatch();

  const sessionId = session?.user?.id || cachedSessionId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem("sessionId");
    if (isGitHubUser) {
      await signOut({ callbackUrl: "/" });
    } else {
      window.location.reload();
    }
    dispatch(addMavenLog(""));
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
