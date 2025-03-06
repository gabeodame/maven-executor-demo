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
import { useMenu } from "@/app/store/MenuContext";

interface CloneRepoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onClone: () => void;
  //   cloning: boolean;
  //   cloned: boolean;
  repoName: string;
  branch: string;
  setBranch: (value: string) => void;
  projectName: string;
  setProjectName: (value: string) => void;
  pomPath: string;
  setPomPath: (value: string) => void;
  //   errorMessage: string;
  repoPath: string;
  setRepoPath: (value: string) => void;
}

const CloneRepoForm = ({
  isOpen,
  onClose,
  onClone,
  //   cloning,
  //   cloned,
  repoName,
  branch,
  setBranch,
  projectName,
  setProjectName,
  pomPath,
  setPomPath,
  //   errorMessage,
  repoPath,
  setRepoPath,
}: CloneRepoFormProps) => {
  const { toggleMenu } = useMenu();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>
            Clone Repository: <span className="text-cyan-400">{repoName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="branch">Branch</Label>
          <Input
            id="branch"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />

          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />

          <Label htmlFor="pom-path">Custom pom.xml Path</Label>
          <Input
            id="pom-path"
            type="text"
            value={pomPath}
            onChange={(e) => setPomPath(e.target.value)}
          />

          <Label htmlFor="repo-path">Repository Subdirectory (optional)</Label>
          <Input
            id="repo-path"
            type="text"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
          />

          {/* {errorMessage && <div className="text-red-600">{errorMessage}</div>} */}
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              onClone();
              toggleMenu();
              onClose();
            }}
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
