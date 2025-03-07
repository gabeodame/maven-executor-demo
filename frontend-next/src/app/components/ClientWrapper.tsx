"use client"; // ✅ Makes this a Client Component

import { useEffect, useState } from "react";
import { useScrollDirection } from "../hooks/useScrollDirection";
import Footer from "./Footer";
import MobileMenu from "./Menu";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const scrollDirection = useScrollDirection();
  const [viewportHeight, setViewportHeight] = useState("100vh");

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(`${window.innerHeight}px`);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div
      className="flex flex-col w-full overflow-hidden"
      style={{ height: viewportHeight, transition: "height 0.3s ease-in-out" }}
    >
      {/* ✅ Sticky Header (Only Show When Scrolling Up) */}
      <header
        className={`w-full h-16 sm:h-20 flex justify-between items-center bg-gray-800 shadow-md text-white px-4 fixed top-0 left-0 z-50 transition-transform ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          📦 Maven Command Executor
        </h1>
        <MobileMenu />
      </header>

      {/* ✅ Main Layout (Fills Remaining Height) */}
      <main className="w-full flex-1 flex flex-col bg-gray-900 mt-16 sm:mt-20 overflow-hidden">
        {children}
      </main>

      {/* ✅ Footer (Fixed at Bottom) */}
      <Footer />
    </div>
  );
}
