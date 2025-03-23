"use client";

import { useEffect, useState } from "react";
import BuildMetrics from "./BuildMetrics";
import ConsoleOutput from "./ConsoleOutput";
import Artifacts from "./Artifacts";
import Executor from "./maven-executors/Executor";
import { Button } from "@/components/ui/button";

export default function MainContent() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isNowDesktop = window.innerWidth >= 1024;
      setIsDesktop(isNowDesktop);
      if (isNowDesktop) setShowExtra(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="bg-gray-800 flex-1 flex flex-col w-full overflow-hidden min-h-0">
      <div className="flex flex-col flex-1 gap-4 overflow-y-auto px-2 pt-2 pb-4 min-h-0 scroll-isolated">
        <div className="flex-shrink-0">
          <Executor />
        </div>

        <div
          className={`w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-2 ${
            isDesktop ? "flex-1 min-h-0" : "flex-shrink-0"
          }`}
        >
          <h3 className="text-lg font-semibold text-center mb-2">
            Console Output
          </h3>
          <div
            className={`rounded-md overflow-y-auto scroll-isolated ${
              isDesktop ? "flex-1 min-h-0" : ""
            }`}
            style={isDesktop ? {} : { height: "40vh" }}
          >
            <ConsoleOutput />
          </div>
        </div>

        {!isDesktop && showExtra && (
          <div className="flex flex-col gap-4 flex-shrink-0">
            <BuildMetrics />
            <Artifacts />
          </div>
        )}

        {!isDesktop && !showExtra && (
          <Button
            variant="secondary"
            onClick={() => setShowExtra(true)}
            className="mx-auto mt-2 w-max"
          >
            📊 Show Metrics & Artifacts
          </Button>
        )}
      </div>
    </section>
  );
}
