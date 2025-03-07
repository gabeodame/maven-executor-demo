"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackEndUrl } from "../util/getbackEndUrl";
import { Separator } from "@/components/ui/separator";

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
    <footer className="w-full h-10 sm:h-14 bg-gray-800 text-gray-300 text-sm flex gap-3 justify-center items-center p-6">
      <span>🔧 Built for Java 17+</span>
      <Separator orientation="vertical" className="h-12 w-12  bg-gray-300" />
      <span>{mavenVersion}</span>
      <Separator orientation="vertical" />
      <span className="">
        <span className="text-sm">GitHub: </span>
        <span>
          <Link
            href="https://github.com/gabeodame/maven-executor-demo"
            target="_blank"
            className="text-blue-400 hover:underline"
          >
            View Repo
          </Link>
        </span>
      </span>
    </footer>
  );
};

export default Footer;
