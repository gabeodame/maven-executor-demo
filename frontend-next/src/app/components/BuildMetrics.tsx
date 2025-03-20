"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks/hooks";

interface BuildMetrics {
  status: string;
  totalTime: string | null;
  testsPassed: string | null;
  testsFailed: string | null;
  errors: string | null;
  warnings: number;
}

export default function BuildMetrics() {
  // ✅ Fetch logs from Redux instead of `useSocket()`
  const logs = useAppSelector((state) => state.logs.mavenLogs);

  const [metrics, setMetrics] = useState<BuildMetrics>({
    status: "Pending",
    totalTime: null,
    testsPassed: null,
    testsFailed: null,
    errors: null,
    warnings: 0,
  });

  useEffect(() => {
    if (!logs.length) return;

    const newMetrics: BuildMetrics = {
      status: "In Progress",
      totalTime: null,
      testsPassed: null,
      testsFailed: null,
      errors: null,
      warnings: 0,
    };

    logs.forEach((log) => {
      if (log.includes("BUILD SUCCESS")) newMetrics.status = "Success";
      if (log.includes("BUILD FAILURE")) newMetrics.status = "Failure";

      if (log.includes("[INFO] Total time:")) {
        const match = log.match(/Total time:\s*([\d.]+) s/);
        newMetrics.totalTime = match ? match[1] : null;
      }

      if (log.includes("Tests run:")) {
        const match = log.match(/Tests run:\s*(\d+),\s*Failures:/);
        newMetrics.testsPassed = match ? match[1] : null;
      }

      if (log.includes("Failures:")) {
        const match = log.match(/Failures:\s*(\d+),\s*Errors:/);
        newMetrics.testsFailed = match ? match[1] : null;
      }

      if (log.includes("Errors:")) {
        const match = log.match(/Errors:\s*(\d+)/);
        newMetrics.errors = match ? match[1] : null;
      }

      if (log.includes("[WARNING]")) {
        newMetrics.warnings += 1;
      }
    });

    setMetrics(newMetrics);
  }, [logs]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Build Metrics</h2>

      <div className="w-full space-y-2">
        <div className="flex justify-between border-b pb-2">
          <span>Status:</span>
          <span
            className={
              metrics.status === "Success"
                ? "text-green-400"
                : metrics.status === "Failure"
                ? "text-red-400"
                : "text-yellow-400"
            }
          >
            {metrics.status}
          </span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span>Total Time:</span>
          <span>{metrics.totalTime ?? "--"} sec</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span>Tests Passed:</span>
          <span className="text-green-400">{metrics.testsPassed ?? "--"}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span>Tests Failed:</span>
          <span className="text-red-400">{metrics.testsFailed ?? "--"}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span>Errors:</span>
          <span className="text-red-500">{metrics.errors ?? "--"}</span>
        </div>
        <div className="flex justify-between">
          <span>Warnings:</span>
          <span className="text-yellow-400">{metrics.warnings ?? "--"}</span>
        </div>
      </div>
    </div>
  );
}
