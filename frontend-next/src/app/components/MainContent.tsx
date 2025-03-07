"use client";

import BuildMetrics from "./BuildMetrics";
import ConsoleOutput from "./ConsoleOutput";
// import Executor from "./Executor";
import Artifacts from "./Artifacts";
import { useEffect, useState } from "react";
import Executor from "./Executor";

export default function MainContent() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // ✅ Detect Desktop Screens to Hide Metrics & Artifacts and Expand ConsoleOutput
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg+ screens
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="h-full flex flex-col w-full overflow-hidden">
      {/* ✅ Executor (Always at the Top) */}
      <div className="w-full min-h-[60px]">
        <Executor />
      </div>

      {/* ✅ Scrollable Main Section */}
      <div className="flex flex-1 overflow-y-auto">
        <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col flex-1 overflow-hidden">
          <h3 className="text-lg font-semibold text-center mb-2">
            Console Output
          </h3>
          <div className="overflow-auto flex-1 bg-gray-900 p-3 rounded-md">
            <ConsoleOutput />
          </div>
        </div>
      </div>

      {/* ✅ Show BuildMetrics & Artifacts on Mobile/Tablet, Hide on Desktop */}
      {!isDesktop && (
        <div className="flex flex-col gap-4 mt-4 overflow-y-auto">
          <BuildMetrics />
          <Artifacts />
        </div>
      )}
    </section>
  );
}
