"use client";

import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "sonner";
import Accordion from "./ui/Accordion";
import CloneRepoForm from "./forms/CloneRepoForm";
import { useSessionCache } from "../store/react-context/SessionProvider";
import { useMenu } from "../store/react-context/MenuContext";
import { useModal } from "../store/react-context/ModalContext";
import { useSocket } from "../hooks/useSocket";
import { useAppDispatch } from "../store/hooks";
import {
  selectProjectThunk,
  setProjects,
} from "../store/redux-toolkit/slices/projectSlice";

interface Repository {
  id: number;
  name: string;
  clone_url: string;
}

export default function RepoList() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [branch, setBranch] = useState("main");
  const [projectName, setProjectName] = useState("");
  const [pomPath, setPomPath] = useState("");
  const [repoPath, setRepoPath] = useState("");

  const { closeMenu } = useMenu();
  const { isOpenModal, openModal, closeModal } = useModal();
  const { sessionId } = useSessionCache();
  const { triggerClone } = useSocket();
  const dispatch = useAppDispatch();

  // ✅ Fetch repositories from backend
  const fetchRepos = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/github/repos", {
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
  }, [sessionId]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // ✅ Handle repository selection
  const handleRepoSelect = (repoName: string) => {
    const selected = repos.find((repo) => repo.name === repoName);
    if (!selected) return;

    setSelectedRepo(selected);
    setBranch("main");
    setProjectName(repoName);
    setPomPath("");
    setRepoPath("");

    closeMenu();
    setTimeout(() => openModal(), 200);
  };

  // ✅ Handle repository cloning
  const handleClone = () => {
    if (!selectedRepo) return;

    closeModal(); // ✅ Close modal immediately to see logs
    triggerClone(selectedRepo.clone_url, branch, projectName, repoPath, pomPath)
      .then(() => {
        toast.success(`🎉 Successfully cloned ${selectedRepo.name}`);
        dispatch(setProjects([projectName])); // ✅ Update Redux store
      })
      .catch((err) => toast.error(`❌ Clone failed: ${err.message}`));
    if (sessionId) {
      dispatch(selectProjectThunk({ sessionId, project: projectName })); // ✅ Select newly cloned project
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
        repoName={projectName}
        branch={branch}
        setBranch={setBranch}
        projectName={projectName}
        setProjectName={setProjectName}
        pomPath={pomPath}
        setPomPath={setPomPath}
        repoPath={repoPath}
        setRepoPath={setRepoPath}
      />

      {/* ✅ Repository Selection */}
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
              {repos.map((repo) => (
                <option key={repo.id} value={repo.name} className="bg-blue-700">
                  {repo.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Toaster />
      </div>
    </Accordion>
  );
}
