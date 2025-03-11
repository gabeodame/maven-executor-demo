"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import Accordion from "./ui/Accordion";
import CloneRepoForm from "./forms/CloneRepoForm";
import Spinner from "./ui/Spinner"; // ✅ Fancy Spinner
import { useSessionCache } from "../store/react-context/SessionProvider";
import { useMenu } from "../store/react-context/MenuContext";
import { useModal } from "../store/react-context/ModalContext";
import { useSocket } from "../hooks/useSocket";
import { useAppDispatch } from "../store/hooks";
import {
  fetchProjects,
  selectProjectThunk,
  setProjects,
} from "../store/redux-toolkit/slices/projectSlice";
// import { getBackEndUrl } from "../util/getbackEndUrl";

interface Repository {
  id: number;
  name: string;
  owner: string;
  clone_url: string;
  branches_url: string;
}

export default function RepoList() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [branches, setBranches] = useState<string[]>([]); // ✅ Store repo branches

  const { closeMenu } = useMenu();
  const { isOpenModal, openModal, closeModal } = useModal();
  const { sessionId } = useSessionCache();
  const { triggerClone } = useSocket();
  const dispatch = useAppDispatch();
  // const backendUrl = getBackEndUrl();

  // ✅ Fetch repositories from backend
  useEffect(() => {
    if (!sessionId) return;

    const fetchRepos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/github/repos`, {
          headers: { "x-session-id": sessionId },
        });

        if (!res.ok) throw new Error("Failed to fetch repositories");

        const data: Repository[] = await res.json();
        setRepos(data);
      } catch (error) {
        console.error("❌ Error fetching repos:", error);
        toast.error("Failed to load repositories.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [sessionId]);

  // ✅ Fetch branches for selected repo
  const fetchBranches = async (repo: Repository) => {
    if (!repo || !repo.branches_url) {
      console.error("❌ No valid repository selected.");
      return [];
    }

    try {
      const res = await fetch(`/api/github/branches`, {
        method: "POST", // ✅ Use POST to send branches_url
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId || "",
        },
        body: JSON.stringify({ branches_url: repo.branches_url }),
      });

      if (!res.ok) throw new Error("Failed to fetch branches");

      const data = await res.json();
      return data.branches || [];
    } catch (error) {
      console.error("❌ Error fetching branches:", error);
      return [];
    }
  };

  // ✅ Handle repository selection
  const handleRepoSelect = async (repo: Repository) => {
    console.log("🚀 Opening Clone Modal");
    console.log("📦 Selected Repo:", repo);

    setSelectedRepo(repo);
    setBranches([]); // ✅ Clear previous branches

    // ✅ Fetch branches dynamically & update state
    const fetchedBranches = await fetchBranches(repo);
    setBranches(fetchedBranches);

    closeMenu();
    setTimeout(() => openModal(), 300);
  };

  // ✅ Handle repository cloning
  const handleClone = async (formData: {
    branch: string;
    projectName: string;
    pomPath?: string;
    repoPath?: string;
  }) => {
    if (!selectedRepo || !sessionId) return;

    const { branch, projectName, pomPath, repoPath } = formData;

    closeModal();
    try {
      await triggerClone(
        selectedRepo.clone_url,
        branch,
        projectName || selectedRepo.name, // ✅ Default to repo name if empty
        repoPath,
        pomPath
      );

      toast.success(`🎉 Successfully cloned ${selectedRepo.name}`);

      // ✅ Fetch updated project list
      dispatch(fetchProjects(sessionId))
        .unwrap()
        .then((updatedProjects) => {
          dispatch(setProjects(updatedProjects));

          if (updatedProjects.includes(projectName)) {
            dispatch(selectProjectThunk({ sessionId, project: projectName }));
          }
        });
    } catch (err) {
      console.error("❌ Clone failed:", err);
      toast.error(`❌ Clone failed: ${err}`);
    }
  };

  return (
    <Accordion
      title="Repository List"
      bgColor="bg-gray-500"
      hoverColor="hover:bg-gray-600"
    >
      {/* ✅ Clone Repository Modal */}
      <CloneRepoForm
        isOpen={isOpenModal}
        onClose={closeModal}
        onClone={handleClone}
        repoName={selectedRepo?.name || ""}
        branches={branches}
      />

      {/* ✅ Repository Selection */}
      <div className="max-w-lg mx-auto p-4 text-white rounded-lg shadow-md">
        <h2 className="font-semibold mb-4 text-center">Select a Repository</h2>

        {loading ? (
          <div className="flex justify-center items-center h-20">
            <Spinner size="lg" color="cyan" />
          </div>
        ) : (
          <select
            onChange={(e) => {
              const repo = repos.find((r) => r.name === e.target.value);
              if (repo) handleRepoSelect(repo);
            }}
            className="w-full p-3 bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-cyan-500 rounded-lg"
          >
            <option value="">-- Select a Repository --</option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.name} className="bg-blue-700">
                {repo.name}
              </option>
            ))}
          </select>
        )}

        <Toaster />
      </div>
    </Accordion>
  );
}
