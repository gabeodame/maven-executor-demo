"use client";

import { useEffect, useState } from "react";

export default function MobileScrollBehavior() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      style={{ height: "64px" }}
      className={`flex items-center fixed top-0 left-0 w-full bg-gray-800 p-4 shadow-md transition-transform duration-300 z-9999 ${
        hideHeader ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
        📦 Maven Command Executor
      </h1>
    </header>
  );
}
