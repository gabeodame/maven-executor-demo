"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSearchParams } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks/hooks";
import {
  closeModal,
  selectIsModalOpen,
} from "@/app/store/redux-toolkit/slices/modalSlice";
import { useSessionCache } from "@/app/store/hooks/useSessionCache";

interface CloneRepoFormProps {
  onClone: (formData: CloneRepoFormData) => void;
  // branches: string[];
}

interface CloneRepoFormData {
  branch: string;
  projectName: string;
  pomPath?: string;
  repoPath?: string;
}

const cloneRepoSchema = yup.object().shape({
  branch: yup.string().required("Branch is required"),
  projectName: yup.string().required("Project name is required"),
  pomPath: yup.string().optional(),
  repoPath: yup.string().optional(),
});

const CloneRepoForm = ({ onClone }: CloneRepoFormProps) => {
  const [branches, setBranches] = useState<string[]>([]);
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsModalOpen);
  const searchParams = useSearchParams();
  const repoName = searchParams.get("repo") || "";
  const branchesUrl = searchParams.get("branches_url") || "";
  const { sessionId } = useSessionCache();
  // const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloneRepoFormData>({
    resolver: yupResolver(cloneRepoSchema),
  });

  const fetchBranches = useCallback(async () => {
    if (!branchesUrl || !sessionId) return;
    try {
      const res = await fetch(`/api/github/branches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          branches_url: decodeURIComponent(branchesUrl),
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch branches");
      const data = await res.json();
      setBranches(data.branches || []);
    } catch (err) {
      console.error("❌ Branch fetch error:", err);
    }
  }, [branchesUrl, sessionId]);

  useEffect(() => {
    if (!!branches.length) {
      reset({
        branch: branches.includes("main") ? "main" : branches[0] || "",
        projectName: repoName,
        pomPath: "",
        repoPath: "",
      });
    }
  }, [repoName, branches, reset, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen, fetchBranches]);

  const handleClose = () => {
    dispatch(closeModal());
    const url = new URL(window.location.href);
    url.searchParams.delete("repo");
    url.searchParams.delete("branches_url");

    window.history.replaceState({}, "", url.toString());
  };

  const handleSubmitForm = (data: CloneRepoFormData) => {
    onClone(data);
    setTimeout(handleClose, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>
            Clone Repository: {repoName || "Select a repository"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="branch">Branch</Label>
            <select
              {...register("branch")}
              id="branch"
              className="bg-gray-800 border border-gray-600 rounded-md p-2"
            >
              {branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))
              ) : (
                <option value="main">main</option>
              )}
            </select>
            {errors.branch && (
              <p className="text-red-400 text-sm">{errors.branch.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input {...register("projectName")} id="project-name" />
            {errors.projectName && (
              <p className="text-red-400 text-sm">
                {errors.projectName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pom-path">Custom pom.xml Path (optional)</Label>
            <Input {...register("pomPath")} id="pom-path" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="repo-path">
              Repository Subdirectory (optional)
            </Label>
            <Input {...register("repoPath")} id="repo-path" />
          </div>

          <DialogFooter className="mt-4 flex justify-end space-x-3">
            <Button type="submit" className="bg-cyan-600 text-white">
              🔂 Clone Repo
            </Button>
            <Button type="button" onClick={handleClose} variant="destructive">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CloneRepoForm;
