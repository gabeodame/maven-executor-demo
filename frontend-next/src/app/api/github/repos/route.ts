import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth/authOptions";

interface GitHubRepo {
  id: number;
  name: string;
  clone_url: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken || !session?.user?.id) {
    console.error("❌ Unauthorized request: Missing session or access token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(`🔍 Fetching repositories for user: ${session.user.email}`);

    const response = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`, // ✅ Use GitHub token
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("❌ GitHub API error:", errorDetails);
      return NextResponse.json(
        {
          error: "Failed to fetch repositories",
          details: errorDetails,
        },
        { status: response.status }
      );
    }

    const repos: GitHubRepo[] = await response.json();

    console.log(`✅ Retrieved ${repos.length} repositories`);

    return NextResponse.json(repos);
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
