"use client";
import { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "sonner";
import Accordion from "./ui/Accordion";
import { useSessionCache } from "../store/SessionProvider";
import CloneRepoForm from "./forms/CloneRepoForm";
import { useSocket } from "../hooks/useSocket";

interface Repository {
  id: number;
  name: string;
  clone_url: string;
}

export default function RepoList() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cloning, setCloning] = useState<boolean>(false);
  // const [cloned, setCloned] = useState<boolean>(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [branch, setBranch] = useState("main");
  const [projectName, setProjectName] = useState("");
  const [pomPath, setPomPath] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  const { triggerClone, cloneLogs } = useSocket();
  const { sessionId } = useSessionCache();

  // ✅ Fetch GitHub repositories
  const fetchRepos = useMemo(() => {
    return async () => {
      setLoading(true);
      try {
        if (!sessionId) {
          console.log("❌ No session ID found");
          return;
        }
        const res = await fetch("/api/github/repos", {
          headers: { "x-session-id": sessionId },
        });

        if (!res.ok) {
          toast.error("Failed to fetch repositories");
          return;
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

  // ✅ Fetch data on mount
  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // ✅ Handle repo selection
  const handleRepoSelect = (repoName: string) => {
    const selected = repos.find((repo) => repo.name === repoName);
    if (selected) {
      setSelectedRepo(selected);
      // setCloned(false);
      setBranch("main");
      setProjectName(selected.name);
      setPomPath("");
      setRepoPath("");
      setIsModalOpen(true);
      // setErrorMessage("");
    }
  };

  // ✅ Handle repository cloning
  const handleClone = async () => {
    if (!selectedRepo) {
      toast.error("❌ Select a repository to clone");
      return;
    }

    if (!sessionId) {
      toast.error("❌ Session ID is missing. Please refresh and try again.");
      return;
    }
    setIsModalOpen(false);
    // setCloning(true);
    // setErrorMessage("");

    try {
      await triggerClone(
        selectedRepo.clone_url,
        branch,
        projectName,
        repoPath,
        pomPath
      );
      toast.success(`🎉 Successfully cloned ${selectedRepo.name}`);
      // setCloned(true);
    } catch (error) {
      console.error("❌ Clone failed:", error);
      toast.error(
        `❌ Clone failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      // setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      // setCloning(false);
    }
  };

  // ✅ Handle clone success or error
  useEffect(() => {
    if (cloning) {
      const lastLog = cloneLogs[cloneLogs.length - 1] || "";
      if (lastLog.includes("✅ Repository cloned successfully")) {
        toast.success(`✅ ${selectedRepo?.name} cloned successfully`);
        // setCloned(true);
        setIsModalOpen(false);
        setCloning(false);
      } else if (lastLog.includes("❌ ERROR")) {
        toast.error(lastLog);
        // setErrorMessage(lastLog);
        setCloning(false);
      }
    }
  }, [cloneLogs, cloning, selectedRepo]);

  return (
    <Accordion
      title="Repository List"
      bgColor="bg-gray-500"
      hoverColor="hover:bg-gray-600"
    >
      <div className="max-w-lg mx-auto p-4 text-white rounded-lg shadow-md">
        <h2 className="font-semibold mb-4 text-center">Select a Repository</h2>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <select
              value={selectedRepo?.name || ""}
              onChange={(e) => handleRepoSelect(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">-- Select a Repository --</option>
              {repos?.map((repo) => (
                <option key={repo.id} value={repo.name} className="bg-blue-700">
                  {repo.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedRepo && (
          <CloneRepoForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onClone={handleClone}
            // cloning={cloning}
            // cloned={cloned}
            repoName={selectedRepo.name}
            branch={branch}
            setBranch={setBranch}
            projectName={projectName}
            setProjectName={setProjectName}
            pomPath={pomPath}
            setPomPath={setPomPath}
            // errorMessage={errorMessage}
            repoPath={repoPath}
            setRepoPath={setRepoPath}
          />
        )}

        <Toaster />
      </div>
    </Accordion>
  );
}
