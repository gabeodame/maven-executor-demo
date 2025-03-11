export interface Artifact {
  name: string; // File or directory name
  path: string; // Absolute or relative path
  size?: number; // Size in bytes (only for files)
  type: "file" | "directory"; // Corrected to ensure uniform structure
  modifiedAt?: string; // Last modified timestamp (optional)
}
