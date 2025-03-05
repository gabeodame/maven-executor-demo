"use client";

import React, { useEffect, useState } from "react";
import Login from "./Login";
import RepoList from "./RepoList";
import { useSession, signOut } from "next-auth/react";
import ProjectList from "./ProjectList";
import { useSessionCache } from "../hooks/useSessionCache";
import { useMenu } from "../store/MenuContext";

function UserAccount() {
  const { data: session, status } = useSession();
  const { sessionId: cachedSessionId } = useSessionCache();
  const [isGithubUser, setIsGithubUser] = useState(false);
  const [isClient, setIsClient] = useState(false); // ✅ Prevent SSR mismatch
  const { toggleMenu } = useMenu();

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
      await signOut({ callbackUrl: "/" }); // ✅ Redirects to home
    } else {
      window.location.reload(); // ✅ Only reload for guest users
    }
  };

  // ✅ Prevent rendering before hydration
  if (!isClient) return null;

  console.log(status);

  return (
    <div className="w-full mb-6">
      <div className="flex w-full">
        {!sessionId ? (
          <Login />
        ) : (
          <button
            className="w-full px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 ease-in transition-all cursor-pointer"
            onClick={() => {
              toggleMenu();
              handleSignOut();
            }}
          >
            SignOut
          </button>
        )}
      </div>
      {status === "authenticated" && (
        <div className="flex w-full my-4">
          <RepoList />
        </div>
      )}
      <div className="mt-3 md:mt-6">{sessionId && <ProjectList />}</div>
    </div>
  );
}

export default UserAccount;
