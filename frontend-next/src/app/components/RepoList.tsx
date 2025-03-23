"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import Accordion from "./ui/Accordion";
import Spinner from "./ui/Spinner";
import CloneRepoForm from "./forms/CloneRepoForm";
import { useAppDispatch } from "../store/hooks/hooks";
import {
  fetchProjects,
  selectProjectThunk,
  setProjects,
} from "../store/redux-toolkit/slices/projectSlice";
import { closeMenu } from "../store/redux-toolkit/slices/menuSlice";
import {
  closeModal,
  openModal,
} from "../store/redux-toolkit/slices/modalSlice";
import { useSessionCache } from "../store/hooks/useSessionCache";
import { useSocket } from "../hooks/useSocket";

interface Repository {
  id: number;
  name: string;
  owner: string;
  clone_url: string;
  branches_url: string;
}

export default function RepoList() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);

  const { sessionId } = useSessionCache();
  const { triggerClone } = useSocket();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!sessionId) return;
    const fetchRepos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/github/repos`, {
          headers: { "x-session-id": sessionId },
        });
        if (!res.ok) throw new Error("Failed to fetch repositories");
        setRepos(await res.json());
      } catch (error) {
        console.error("❌ Repo fetch error:", error);
        toast.error("Failed to load repositories.");
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, [sessionId]);

  const handleRepoSelect = async (repo: Repository) => {
    dispatch(closeMenu());
    router.push(
      `?repo=${repo.name}&branches_url=${encodeURIComponent(repo.branches_url)}`
    );

    setTimeout(() => dispatch(openModal()), 200);
  };

  const handleClone = async (formData: {
    branch: string;
    projectName: string;
    pomPath?: string;
    repoPath?: string;
  }) => {
    const repoName = searchParams.get("repo");
    const selectedRepo = repos.find((r) => r.name === repoName);
    if (!selectedRepo || !sessionId) return;

    dispatch(closeModal());
    try {
      await triggerClone(
        selectedRepo.clone_url,
        formData.branch,
        formData.projectName,
        formData.repoPath,
        formData.pomPath
      );

      toast.success(`🎉 Successfully cloned ${selectedRepo.name}`);
      dispatch(fetchProjects(sessionId))
        .unwrap()
        .then((updated) => {
          dispatch(setProjects(updated));
          if (updated.includes(formData.projectName)) {
            dispatch(
              selectProjectThunk({ sessionId, project: formData.projectName })
            );
          }
        });
    } catch (err) {
      toast.error(`❌ Clone failed: ${err}`);
    }
  };

  return (
    <Accordion
      title="Repository List"
      bgColor="bg-gray-500"
      hoverColor="hover:bg-gray-600"
    >
      <CloneRepoForm onClone={handleClone} />

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
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg"
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
