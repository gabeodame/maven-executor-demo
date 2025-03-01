import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
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

    // ✅ Execute `git clone` using `execPromise`
    try {
      const { stderr } = await execPromise(`git clone ${clone_url} ${repoDir}`);

      if (stderr) {
        console.warn(`⚠️ Git Clone Warning: ${stderr}`);
      }
      console.log(`✅ Cloned ${repoName} into ${repoDir}`);

      // ✅ Update backend-node with the cloned repo path
      const backendResponse = await fetch(
        "http://localhost:5001/api/set-repo-path",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoPath: repoDir }),
        }
      );

      if (!backendResponse.ok) {
        console.error("❌ Failed to update repo path in backend-node");
        return NextResponse.json(
          { error: "Repository cloned, but failed to update backend" },
          { status: 500 }
        );
      }

      console.log("✅ Repo path updated in backend-node");
      return NextResponse.json({ message: `Cloned ${repoName} successfully` });
    } catch (cloneError) {
      console.error("❌ Git Clone Failed:", cloneError);
      return NextResponse.json(
        { error: "Failed to clone repository" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
