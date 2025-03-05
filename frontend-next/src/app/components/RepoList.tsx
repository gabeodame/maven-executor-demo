"use client";
import { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "sonner";
import Accordion from "./ui/Accordion";
import { useSessionCache } from "../hooks/useSessionCache";
import { useMenu } from "../store/MenuContext";

interface Repository {
  id: number;
  name: string;
  clone_url: string;
}

export default function RepoList() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cloning, setCloning] = useState<boolean>(false);
  const [cloned, setCloned] = useState<boolean>(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const { toggleMenu } = useMenu();

  const backendUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_VITE_API_URL!
      : process.env.NEXT_PUBLIC_DEV_URL!;

  const { sessionId } = useSessionCache(); // ✅ Use cached session for guests

  console.log("🔒 Session ID:", sessionId);

  // Fetch GitHub repositories
  const fetchRepos = useMemo(() => {
    return async () => {
      setLoading(true);
      try {
        if (!sessionId) {
          console.log("❌ No session ID found");
          return;
        }
        const res = await fetch("/api/github/repos", {
          headers: {
            "x-session-id": sessionId,
          },
        });

        if (!res.ok) {
          toast("Failed to fetch project list");
        }

        const data: Repository[] = await res.json();
        setRepos(data);
      } catch (error) {
        console.error("❌ Error fetching repos:", error);
        toast.error("Failed to load repositories.");
      } finally {
        setLoading(false);
      }
    };
  }, [sessionId]);

  // Fetch data on mount
  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Handle repository cloning
  const handleClone = async () => {
    if (!selectedRepo) {
      toast.error("Select a repository to clone");
      return;
    }

    try {
      if (!sessionId) {
        console.error("❌ No session ID found");
        toast.error("Session ID is missing. Please refresh and try again.");
        return;
      }

      setCloning(true);

      const response = await fetch(`${backendUrl}/api/clone-repo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          repoUrl: selectedRepo.clone_url,
          branch: "main",
          projectName: selectedRepo.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to clone repository");
      }

      console.log("✅ Repo cloned successfully for session:", sessionId);
      setCloned(true);
      toggleMenu();
      toast.success(`Repository ${selectedRepo.name} cloned successfully`);
    } catch (error) {
      console.error("❌ Clone error:", error);
      toast.error("Failed to clone repository");
      setCloned(false);
    } finally {
      setCloning(false);
    }
  };

  return (
    <Accordion
      title="Repository List"
      bgColor="bg-gray-500"
      hoverColor="hover:bg-gray-600"
      titleSize=""
    >
      <div className="max-w-lg mx-auto p-4  text-white rounded-lg shadow-md">
        <h2 className="font-semibold mb-4 text-center">Select a Repository</h2>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <select
              value={selectedRepo?.name || ""}
              onChange={(e) => {
                const selected = repos.find(
                  (repo) => repo.name === e.target.value
                );
                setSelectedRepo(selected || null);
                setCloned(false);
              }}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">-- Select a Repository --</option>
              {Array.isArray(repos) &&
                repos?.map((repo) => (
                  <option
                    key={repo.id}
                    value={repo.name}
                    className="bg-blue-700"
                  >
                    {repo.name}
                  </option>
                ))}
            </select>

            <button
              onClick={handleClone}
              disabled={!selectedRepo || cloning || cloned}
              className={`w-full text-white px-4 py-2 rounded-lg ease-in transition-all ${
                cloning
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-cyan-800 hover:bg-cyan-900 cursor-pointer"
              }`}
            >
              {cloning
                ? "Cloning..."
                : cloned
                ? `✅ Clone Successful`
                : "Clone Repository"}
            </button>
          </div>
        )}

        <Toaster />
      </div>
    </Accordion>
  );
}
