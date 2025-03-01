"use client";
import { useEffect, useState } from "react";

interface BuildMetrics {
  status: string;
  totalTime: string | number | null;
  testsPassed: string | number | null;
  testsFailed: string | number | null;
  errors: string | number | null;
  warnings: string | number | null;
}

export default function BuildMetrics() {
  const [metrics, setMetrics] = useState<BuildMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const isProd = process.env.NODE_ENV === "production";
  const backendUrl = isProd
    ? process.env.NEXT_PUBLIC_VITE_API_URL ||
      "https://maven-executor-demo.fly.dev"
    : "http://localhost:5001";

  useEffect(() => {
    console.log(
      "🔍 Fetching build metrics from:",
      `${backendUrl}/api/build-metrics`
    );

    fetch(`${backendUrl}/api/build-metrics`)
      .then((res) => res.json())
      .then((data) => {
        console.log("📊 Build Metrics Received:", data);
        setMetrics(data);
      })
      .catch((err) => {
        console.error("❌ Error fetching build metrics:", err);
        setMetrics(null);
      })
      .finally(() => setLoading(false));
  }, [backendUrl]);

  if (loading) return <p>Loading build metrics...</p>;
  if (!metrics) return <p>No build data available.</p>;

  return (
    <div className="w-full max-w-lg p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Build Metrics</h2>
      <div className="space-y-2">
        <div className="flex justify-between border-b pb-2">
          <span>Status:</span>
          <span
            className={
              metrics.status === "Success" ? "text-green-400" : "text-red-400"
            }
          >
            {metrics.status}
          </span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span>Total Time:</span>
          <span>{metrics.totalTime} sec</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span>Tests Passed:</span>
          <span className="text-green-400">{metrics.testsPassed}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span>Tests Failed:</span>
          <span className="text-red-400">{metrics.testsFailed}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span>Errors:</span>
          <span className="text-red-500">{metrics.errors}</span>
        </div>
        <div className="flex justify-between">
          <span>Warnings:</span>
          <span className="text-yellow-400">{metrics.warnings}</span>
        </div>
      </div>
    </div>
  );
}
