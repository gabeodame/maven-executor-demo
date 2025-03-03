interface BuildMetrics {
  status: string;
  totalTime: string | null;
  testsPassed: string | null;
  testsFailed: string | null;
  errors: string | null;
  warnings: number;
}

// ✅ Store build metrics per session
const lastBuildMetrics: Record<string, BuildMetrics> = {};

/**
 * ✅ Extract Build Metrics from Maven logs
 * @param log - Maven build log output
 * @param exitCode - Process exit code
 * @param sessionId - Unique user session ID
 */
export const extractBuildMetrics = (
  log: string,
  exitCode: number,
  sessionId: string
): BuildMetrics => {
  const totalTimeMatch = log.match(/\[INFO\] Total time: ([\d\.]+) s/);
  const totalTime = totalTimeMatch ? totalTimeMatch[1] : null;

  const testsPassedMatch = log.match(
    /Tests run: (\d+),\s*Failures: 0,\s*Errors: 0/
  );
  const testsPassed = testsPassedMatch ? testsPassedMatch[1] : "0";

  const testsFailedMatch = log.match(/Failures:\s*(\d+)/);
  const testsFailed = testsFailedMatch ? testsFailedMatch[1] : "0";

  const errorsMatch = log.match(/Errors:\s*(\d+)/);
  const errors = errorsMatch ? errorsMatch[1] : "0";

  const warningsCount = (log.match(/\[WARNING\]/g) || []).length;

  lastBuildMetrics[sessionId] = {
    status: exitCode === 0 ? "Success" : "Failed",
    totalTime,
    testsPassed,
    testsFailed,
    errors,
    warnings: warningsCount,
  };

  console.log(
    `📊 Updated Build Metrics for ${sessionId}:`,
    lastBuildMetrics[sessionId]
  );

  return lastBuildMetrics[sessionId];
};

/**
 * ✅ Retrieve Build Metrics for a session
 * @param sessionId - Unique user session ID
 * @returns BuildMetrics object
 */
export const getLastBuildMetrics = (sessionId: string): BuildMetrics | null => {
  return lastBuildMetrics[sessionId] || null;
};
