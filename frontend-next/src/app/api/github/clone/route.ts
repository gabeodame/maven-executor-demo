import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const { clone_url } = await req.json();

  if (!clone_url) {
    return NextResponse.json({ error: "Missing clone URL" }, { status: 400 });
  }

  const repoName = path.basename(clone_url, ".git");
  const repoDir = path.resolve("/tmp", repoName);
  console.log(`✅ Cloning into: ${repoDir}`);

  if (fs.existsSync(repoDir)) {
    fs.rmSync(repoDir, { recursive: true, force: true });
  }

  return new Promise((resolve) => {
    exec(`git clone ${clone_url} ${repoDir}`, async (error, stdout, stderr) => {
      if (error) {
        resolve(
          NextResponse.json(
            { error: "Failed to clone repository", details: stderr },
            { status: 500 }
          )
        );
      } else {
        console.log(`✅ Cloned ${repoName} into ${repoDir}`);

        // ✅ Tell backend-node to use the cloned repo
        try {
          const res = await fetch("http://localhost:5001/api/set-repo-path", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoPath: repoDir }),
          });

          if (!res.ok) {
            console.error("❌ Failed to update repo path in backend-node");
          } else {
            console.log("✅ Repo path updated in backend-node");
          }
        } catch (err) {
          console.error("❌ Error updating repo path:", err);
        }

        resolve(
          NextResponse.json({ message: `Cloned ${repoName} successfully` })
        );
      }
    });
  });
}
