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
import { useMenu } from "@/app/store/react-context/MenuContext";

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
              className="bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 focus:outline-none transition-all duration-200 placeholder-gray-400 text-white rounded-md px-3 py-2 selection:bg-gray-600 selection:text-gray-100"
              placeholder="Enter branch name..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 focus:outline-none transition-all duration-200 placeholder-gray-400 text-white rounded-md px-3 py-2 selection:bg-gray-600 selection:text-gray-100"
              placeholder="Enter project name..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pom-path">Custom pom.xml Path</Label>
            <Input
              id="pom-path"
              type="text"
              value={pomPath}
              onChange={(e) => setPomPath(e.target.value)}
              className="bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 focus:outline-none transition-all duration-200 placeholder-gray-400 text-white rounded-md px-3 py-2 selection:bg-gray-600 selection:text-gray-100"
              placeholder="Specify pom.xml path..."
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
              className="bg-gray-800 border border-gray-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 focus:outline-none transition-all duration-200 placeholder-gray-400 text-white rounded-md px-3 py-2 selection:bg-gray-600 selection:text-gray-100"
              placeholder="Enter subdirectory..."
            />
          </div>

          {/* Optional Error Message */}
          {/* {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )} */}
        </div>

        <DialogFooter className="mt-4 flex justify-end space-x-3">
          <Button
            onClick={() => {
              onClone();
              toggleMenu();
              onClose();
            }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-4 py-2 rounded-md transition-all"
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
