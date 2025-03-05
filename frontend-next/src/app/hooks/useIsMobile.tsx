"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to determine if the viewport is below the desktop breakpoint (`lg: 1024px`).
 * @returns `true` if on mobile/tablet, `false` if on desktop+.
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg: 1024px breakpoint
    };

    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  return isMobile;
};
