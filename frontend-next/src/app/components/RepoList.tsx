"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import GithubIntegration from "./GithubIntegration";
import CustomToast from "./ui/Toaster";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  const backendUrl =
    process.env.NEXT_PUBLIC_VITE_API_URL ||
    "https://maven-executor-demo.fly.dev";

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
  const handleCloneAndUpload = async () => {
    if (!selectedRepo) {
      alert("Please select a repository!");
      return;
    }

    setCloning(true);
    console.log("📂 Cloning repo:", selectedRepo.clone_url);

    try {
      const response = await fetch("/api/github/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clone_url: selectedRepo.clone_url }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Clone error:", result);
        CustomToast({ message: "Failed to clone repository", type: "error" });
        setCloned(false);
        return;
      }

      console.log("📦 Repo cloned & zipped, uploading to backend...");

      // ✅ Upload ZIP to backend
      const formData = new FormData();
      formData.append("file", result.zipPath); // Path to the ZIP file

      const uploadResponse = await fetch(
        `${backendUrl}/api/upload-java-project`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        console.error("❌ Upload error:", await uploadResponse.json());
        CustomToast({ message: "Failed to upload repo", type: "error" });
        setCloned(false);
        return;
      }

      CustomToast({
        message: "Repository cloned & uploaded successfully",
        type: "success",
      });
      setCloned(true);

      // ✅ Reload app to reflect updated Java project path
      router.refresh();
    } catch (error) {
      console.error("❌ Clone error:", error);
      CustomToast({ message: "Failed to clone repository", type: "error" });
      setCloned(false);
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
            onClick={handleCloneAndUpload}
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
              ? `✅ Cloned & Uploaded`
              : "Clone & Upload Repo"}
          </button>
        </div>
      )}
    </div>
  );
}
