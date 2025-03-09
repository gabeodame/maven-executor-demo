"use client";

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
  onClone: () => void;
  repoName: string;
  branch: string;
  setBranch: (value: string) => void;
  projectName: string;
  setProjectName: (value: string) => void;
  pomPath: string;
  setPomPath: (value: string) => void;
  repoPath: string;
  setRepoPath: (value: string) => void;
}

const CloneRepoForm = ({
  isOpen,
  onClose,
  onClone,
  repoName,
  branch,
  setBranch,
  projectName,
  setProjectName,
  pomPath,
  setPomPath,
  repoPath,
  setRepoPath,
}: CloneRepoFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border border-gray-700 shadow-xl">
        <DialogHeader>
          <DialogTitle>
            Clone Repository: <span className="text-cyan-400">{repoName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pom-path">Custom pom.xml Path</Label>
            <Input
              id="pom-path"
              type="text"
              value={pomPath}
              onChange={(e) => setPomPath(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="repo-path">
              Repository Subdirectory (optional)
            </Label>
            <Input
              id="repo-path"
              type="text"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end space-x-3">
          <Button
            onClick={onClone}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md"
          >
            🔂 Clone Repo
          </Button>
          <Button onClick={onClose} variant="destructive">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloneRepoForm;
