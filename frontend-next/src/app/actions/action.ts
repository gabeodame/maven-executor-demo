export async function fetchProjects(sessionId: string) {
  if (!sessionId) return;
  try {
    const backendUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_VITE_API_URL!
        : process.env.NEXT_PUBLIC_DEV_URL!;
    const res = await fetch(`${backendUrl}/api/user-projects`, {
      headers: {
        "x-session-id": sessionId,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch projects");

    const projectList: string[] = await res.json();
    console.log("📂 Fetched Projects:", projectList);
    return projectList;
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
  }
}
