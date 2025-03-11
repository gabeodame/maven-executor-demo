"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

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

interface CloneRepoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onClone: (formData: CloneRepoFormData) => void;
  repoName: string;
  branches: string[];
}

interface CloneRepoFormData {
  branch: string;
  projectName: string;
  pomPath?: string;
  repoPath?: string;
}

// ✅ Form Validation Schema (Using Yup)
const cloneRepoSchema = yup.object().shape({
  branch: yup.string().required("Branch is required"),
  projectName: yup.string().required("Project name is required"),
  pomPath: yup.string().optional(),
  repoPath: yup.string().optional(),
});

const CloneRepoForm = ({
  isOpen,
  onClose,
  onClone,
  repoName,
  branches,
}: CloneRepoFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloneRepoFormData>({
    resolver: yupResolver(cloneRepoSchema),
  });

  // ✅ Prefill form fields when the modal opens
  useEffect(() => {
    if (repoName) {
      reset({
        branch: branches.includes("main") ? "main" : branches[0] || "",
        projectName: repoName, // ✅ Prefill project name with repoName
        pomPath: "",
        repoPath: "",
      });
    }
  }, [repoName, branches, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border border-gray-700 shadow-xl">
        <DialogHeader>
          <DialogTitle>
            Clone Repository: {repoName || "Select a repository"}
          </DialogTitle>
        </DialogHeader>

        {/* ✅ Form Submission */}
        <form onSubmit={handleSubmit(onClone)} className="space-y-4">
          {/* 🔹 Branch Selection */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="branch">Branch</Label>
            <select
              {...register("branch")}
              id="branch"
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md"
            >
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
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

          {/* 🔹 Project Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input {...register("projectName")} id="project-name" />
            {errors.projectName && (
              <p className="text-red-400 text-sm">
                {errors.projectName.message}
              </p>
            )}
          </div>

          {/* 🔹 Custom pom.xml Path */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="pom-path">Custom pom.xml Path (optional)</Label>
            <Input {...register("pomPath")} id="pom-path" />
          </div>

          {/* 🔹 Repository Subdirectory */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="repo-path">
              Repository Subdirectory (optional)
            </Label>
            <Input {...register("repoPath")} id="repo-path" />
          </div>

          {/* ✅ Form Actions */}
          <DialogFooter className="mt-4 flex justify-end space-x-3">
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md"
            >
              🔂 Clone Repo
            </Button>
            <Button type="button" onClick={onClose} variant="destructive">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CloneRepoForm;
