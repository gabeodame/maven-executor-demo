import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth/authOptions";

export async function POST(req: NextRequest) {
  try {
    // ✅ Parse request body
    const { branches_url } = await req.json();
    if (!branches_url) {
      return NextResponse.json(
        { error: "branches_url is required" },
        { status: 400 }
      );
    }

    // ✅ Get GitHub access token
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    console.log(
      "🔑 GitHub Access Token:",
      accessToken ? "Present ✅" : "Missing ❌"
    );

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized: No Access Token" },
        { status: 401 }
      );
    }

    // ✅ Remove placeholder `{/branch}` from branches_url
    const apiUrl = branches_url.replace("{/branch}", "");
    console.log("🔍 Fetching branches from:", apiUrl);

    // ✅ Call GitHub API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "MavenExecutor",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ GitHub API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `GitHub API Error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const branches = await response.json();
    console.log(
      "✅ Successfully fetched branches:",
      branches.map((b: { name: string }) => b.name)
    );

    return NextResponse.json({
      branches: branches.map((b: { name: string }) => b.name),
    });
  } catch (error) {
    console.error("❌ Error fetching branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
