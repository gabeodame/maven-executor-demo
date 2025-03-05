import BuildMetrics from "./BuildMetrics";
import ConsoleOutput from "./ConsoleOutput";
import Executor from "./Executor";
import Artifacts from "./Artifacts";

export default function MainContent() {
  return (
    <section className="h-full flex flex-col gap-6 p-4 w-full overflow-y-auto">
      <div className="w-full h-full flex flex-col gap-6 overflow-hidden">
        {/* ✅ Maven Executor (Fixed at the Top) */}
        <div className="shrink-0 min-h-[60px]">
          <Executor />
        </div>

        {/* ✅ Scrollable Section */}
        <div className="flex-1 overflow-y-auto lg:overflow-visible">
          {/* ✅ Console Output (Takes Full Remaining Height) */}
          <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col flex-1 min-h-[300px] lg:min-h-[500px]">
            <h3 className="text-lg font-semibold text-center mb-2">
              Console Output
            </h3>
            <div className="overflow-auto flex-1 bg-gray-900 p-3 rounded-md">
              <ConsoleOutput />
            </div>
          </div>

          {/* ✅ On Mobile & Tablet: Metrics & Artifacts Scroll with Console */}
          <div className="flex flex-col gap-4 mt-4 lg:hidden">
            <BuildMetrics />
            <Artifacts />
          </div>
        </div>
      </div>
    </section>
  );
}
