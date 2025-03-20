"use client";

import { useEffect, useRef } from "react";
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
import { useAppDispatch, useAppSelector } from "@/app/store/hooks/hooks";
import { closeMenu } from "@/app/store/redux-toolkit/slices/menuSlice";
import {
  closeModal,
  selectIsModalOpen,
} from "@/app/store/redux-toolkit/slices/modalSlice";

interface CloneRepoFormProps {
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

const CloneRepoForm = ({ onClone, repoName, branches }: CloneRepoFormProps) => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsModalOpen);
  const latestRepoName = useRef(repoName); // ✅ Track latest repo name

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloneRepoFormData>({
    resolver: yupResolver(cloneRepoSchema),
  });

  // ✅ Ensure Form Resets on Repo Selection (Only when modal opens)
  useEffect(() => {
    if (isOpen) {
      latestRepoName.current = repoName; // ✅ Store latest repo name
      console.log("🔄 Resetting form with repo:", latestRepoName.current);

      reset({
        branch: branches.includes("main") ? "main" : branches[0] || "",
        projectName: latestRepoName.current, // ✅ Ensure repo name is correct
        pomPath: "",
        repoPath: "",
      });
    }
  }, [repoName, branches, reset, isOpen]);
  // ✅ Close Modal and Ensure Redux State Updates
  const handleClose = () => {
    dispatch(closeMenu()); // ✅ Ensure menu closes first
    dispatch(closeModal()); // ✅ Close the modal properly
  };

  // ✅ Fix: Prevent default event issues on mobile
  const handleSubmitForm = (data: CloneRepoFormData) => {
    console.log("🛠️ Submitting Clone Form: ", data);

    onClone(data); // ✅ Ensure `handleClone` executes before closing modal

    setTimeout(() => {
      dispatch(closeMenu()); // ✅ Close menu first
      dispatch(closeModal()); // ✅ Then close modal
    }, 100); // ✅ Small delay ensures `onClone` runs first
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 text-white border border-gray-700 shadow-xl">
        <DialogHeader>
          <DialogTitle>
            Clone Repository: {repoName || "Select a repository"}
          </DialogTitle>
        </DialogHeader>

        {/* ✅ Form Submission */}
        <form
          onSubmit={handleSubmit(handleSubmitForm)} // ✅ Fix: Ensure function is wrapped
          className="space-y-4"
        >
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
