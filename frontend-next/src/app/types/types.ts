export interface Artifact {
  name: string; // File or directory name
  path: string; // Absolute or relative path to the artifact
  size?: number; // Size in bytes (if applicable, only for files)
  type: "file" | "directory"; // Distinguish between files and directories
  modifiedAt?: string; // ISO timestamp of last modification (optional)
  children?: Artifact[]; // For directories, holds nested files/folders
}
