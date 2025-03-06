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
  cloning: boolean;
  cloned: boolean;
  repoName: string;
  branch: string;
  setBranch: (value: string) => void;
  projectName: string;
  setProjectName: (value: string) => void;
  pomPath: string;
  setPomPath: (value: string) => void;
  errorMessage: string;
}

const CloneRepoForm: React.FC<CloneRepoFormProps> = ({
  isOpen,
  onClose,
  onClone,
  cloning,
  cloned,
  repoName,
  branch,
  setBranch,
  projectName,
  setProjectName,
  pomPath,
  setPomPath,
  errorMessage,
}) => {
  console.log(errorMessage);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>
            Clone Repository: <span className="text-cyan-400">{repoName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Branch (e.g., main, develop, feature/*)"
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Name (optional)"
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pom-path">Custom pom.xml Path</Label>
            <Input
              id="pom-path"
              type="text"
              value={pomPath}
              onChange={(e) => setPomPath(e.target.value)}
              placeholder="e.g., /pom.xml or /backend/pom.xml"
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            />
          </div>
        </div>
        {/* ✅ Display error message */}
        {errorMessage && (
          <div className="text-sm text-center font-bold bg-red-800 text-white p-2 rounded-md">
            {errorMessage}
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 mt-4">
          <Button
            onClick={onClose}
            variant="destructive"
            className="px-4 py-2 bg-red-900 hover:bg-red-700 text-white rounded-lg ease-in transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={onClone}
            disabled={cloning}
            variant="default"
            className="px-4 py-2 bg-green-900 hover:bg-green-700 text-white rounded-lg flex justify-center items-center ease-in transition-colors"
          >
            {cloning ? (
              <>🔄 Cloning...</>
            ) : cloned ? (
              <>🎉 Cloned!</>
            ) : (
              <>🔂 Clone Repo</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloneRepoForm;
