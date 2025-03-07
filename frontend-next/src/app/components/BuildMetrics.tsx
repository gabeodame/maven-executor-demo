"use client";
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

interface BuildMetrics {
  status: string;
  totalTime: string | null;
  testsPassed: string | null;
  testsFailed: string | null;
  errors: string | null;
  warnings: number;
}

export default function BuildMetrics() {
  const { mavenLogs: logs } = useSocket();
  const [metrics, setMetrics] = useState<BuildMetrics>({
    status: "Pending",
    totalTime: null,
    testsPassed: null,
    testsFailed: null,
    errors: null,
    warnings: 0,
  });

  //   console.log("📊 Build Metrics Logs:", logs);
  useEffect(() => {
    if (logs?.length === 0) return;

    // console.log("📊 Processing logs for Build Metrics...");

    const newMetrics: BuildMetrics = {
      status: "In Progress",
      totalTime: null,
      testsPassed: null,
      testsFailed: null,
      errors: null,
      warnings: 0,
    };

    logs?.forEach((log) => {
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

    // console.log("📈 Updated Build Metrics:", newMetrics);
    setMetrics(newMetrics);
  }, [logs]); // ✅ Reprocess metrics whenever logs update

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
