"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackEndUrl } from "../util/getbackEndUrl";

const Footer = () => {
  const [mavenVersion, setMavenVersion] = useState("Maven: Latest");

  useEffect(() => {
    const fetchMavenVersion = async () => {
      const backendUrl = getBackEndUrl();
      try {
        const url = `${backendUrl}/api/maven-version`;

        const res = await fetch(url);
        const data = await res.json();
        setMavenVersion(data.version || "Maven: Latest");
      } catch (error) {
        console.error("❌ Error fetching Maven version:", error);
        setMavenVersion("Maven: Unknown");
      }
    };
    fetchMavenVersion();
  }, []);

  return (
    <footer className="w-full h-12 bg-gray-800 text-gray-300 text-sm flex justify-between items-center px-6">
      <span>🔧 Built for Java 17+ | {mavenVersion}</span>{" "}
      <span>
        🚀 Version: 1.0.0 | GitHub:{" "}
        <Link
          href="https://github.com/gabeodame/maven-executor-demo"
          target="_blank"
          className="text-blue-400 hover:underline"
        >
          View Repo
        </Link>
      </span>
    </footer>
  );
};

export default Footer;
