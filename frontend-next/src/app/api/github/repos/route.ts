import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`, // ✅ Pass GitHub token
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch repositories",
          details: await response.json(),
        },
        { status: response.status }
      );
    }

    const repos = await response.json();

    return NextResponse.json(repos);
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: error },
      { status: 500 }
    );
  }
}
