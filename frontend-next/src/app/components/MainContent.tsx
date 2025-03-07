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
    <section className="h-full flex flex-col w-full overflow-y-auto pb-2 relative">
      {/* ✅ Make the entire MainContent scrollable as one unit */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Executor /> {/* ✅ Executor now scrolls with everything */}
        <div className="w-full h-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-center mb-2">
            Console Output
          </h3>
          <div className="overflow-hidden flex-1 bg-gray-900 p-3 rounded-md">
            <ConsoleOutput />
          </div>
        </div>
        {/* ✅ Keep BuildMetrics & Artifacts inside the main scroll container */}
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
