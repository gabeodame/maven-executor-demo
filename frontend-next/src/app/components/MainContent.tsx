"use client";

import BuildMetrics from "./BuildMetrics";
import ConsoleOutput from "./ConsoleOutput";
import Executor from "./Executor";
import Artifacts from "./Artifacts";
import { useEffect, useState } from "react";

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
    <section className="h-full flex flex-col w-full overflow-hidden lg:min-h-[calc(100vh-290px)]">
      {/* ✅ Executor (Always at the Top) */}
      <div className="shrink-0 min-h-[60px]">
        <Executor />
      </div>

      {/* ✅ Scrollable Main Section (ConsoleOutput Fills Space on Desktop) */}
      <div className="flex flex-col flex-1 overflow-y-auto lg:h-full">
        <div
          className={`w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col ${
            isDesktop ? "flex-1" : "min-h-[300px]"
          } max-h-[calc(100vh-290px)] overflow-auto`}
        >
          <h3 className="text-lg font-semibold text-center mb-2">
            Console Output
          </h3>
          <div className="overflow-auto flex-1 bg-gray-900 p-3 rounded-md lg:max-h-[calc(100vh-290px)]">
            <ConsoleOutput />
          </div>
        </div>

        {/* ✅ Show BuildMetrics & Artifacts on Mobile/Tablet, Hide on Desktop */}
        {!isDesktop && (
          <div className="flex flex-col gap-4 mt-4">
            <BuildMetrics />
            <Artifacts />
          </div>
        )}
      </div>
    </section>
  );
}
