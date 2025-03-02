"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import GithubIntegration from "./GithubIntegration";
import { Toaster, toast } from "sonner";

export default function RepoList() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<
    { id: number; name: string; clone_url: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [cloned, setCloned] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<{
    name: string;
    clone_url: string;
  } | null>(null);

  // ✅ Fetch GitHub repos
  useEffect(() => {
    if (!session?.accessToken) return;

    setLoading(true);
    fetch("/api/github/repos", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRepos(data);
      })
      .catch((err) => {
        console.error("❌ Error fetching repos:", err);
      })
      .finally(() => setLoading(false));
  }, [session]);

  // ✅ Clone, Zip, & Upload Repo
  const handleClone = async () => {
    if (!selectedRepo) {
      toast.error("Please select a repository to clone");
      return;
    }

    setCloning(true);
    console.log("📂 Sending clone request for:", selectedRepo.clone_url);

    const backendUrl =
      process.env.NEXT_PUBLIC_DEV_URL || process.env.NEXT_PUBLIC_VITE_API_URL;

    if (!backendUrl) {
      console.error(
        "❌ Backend URL is not defined. Check environment variables."
      );
      toast.error("Internal configuration error: Missing API URL");
      setCloning(false);
      return;
    }

    try {
      const url = `${backendUrl}/api/clone-repo`;
      console.log("🔗 Cloning repository via:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: selectedRepo.clone_url }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Repository cloned successfully:", result);
        setCloned(true);
        toast.success("Repository cloned & uploaded successfully");
      } else {
        console.error("❌ Clone error:", result.error || "Unknown error");
        toast.error(`Clone failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Clone error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to clone repository: ${errorMessage}`);
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <div className="w-full mb-4">
        <GithubIntegration />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center">
        Select a Repository
      </h2>

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
            {repos.map((repo) => (
              <option key={repo.id} value={repo.name} className="bg-blue-700">
                {repo.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleClone}
            disabled={!selectedRepo || cloning || cloned}
            className={`w-full text-white px-4 py-2 rounded-lg transition-all ${
              cloning
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-cyan-900 hover:bg-cyan-800 cursor-pointer"
            }`}
          >
            {cloning
              ? "Cloning..."
              : cloned
              ? `✅ Clone Succesful`
              : "Clone Repository"}
          </button>
        </div>
      )}
      <Toaster />
    </div>
  );
}
