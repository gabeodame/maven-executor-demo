import Artifacts from "./components/Artifacts";
import BuildMetrics from "./components/BuildMetrics";
import ConsoleOutput from "./components/ConsoleOutput";
import Executor from "./components/Executor";
import SideBarLeft from "./components/SideBarLeft";

export default function Home() {
  return (
    <section className="w-full flex flex-col md:flex-row bg-gray-900 text-white h-screen overflow-hidden">
      {/* Left Sidebar (Scrollable) */}
      <SideBarLeft />

      {/* ✅ Main Content (Entire Section is Now Scrollable) */}
      <section className="flex flex-col gap-6 p-4 w-full h-full overflow-y-auto">
        {/* Ensure full height for scrolling */}
        <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-[60%_40%] gap-6">
          {/* Left side (Executor & Console Output) */}
          <div className="flex flex-col gap-6 w-full">
            {/* Maven Executor */}
            <Executor />

            {/* Console Output (✅ Healthy height & scrolls within itself) */}
            <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col flex-1 min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
              <h3 className="text-lg font-semibold text-center mb-2">
                Console Output
              </h3>
              <div className="flex-1 overflow-hidden bg-gray-900 p-3 rounded-md">
                <ConsoleOutput />
              </div>
            </div>

            {/* 📌 Metrics & Artifacts (✅ Now scrolls with Main Section) */}
            {/* <div className="flex flex-col gap-4 w-full">
              <BuildMetrics />
              <Artifacts />
            </div> */}
          </div>

          {/* Right Sidebar (✅ Scrolls with Main) */}
          <aside className="bg-gray-700 px-2 shadow-md w-full md:w-full md:mt-6 lg:mt-0 lg:w-full flex flex-col gap-4">
            {/* Repo List (Hidden on mobile, shown on lg+) */}

            {/* 📌 Metrics & Artifacts Flow with Main Content */}
            <div className="flex flex-col md:flex-row lg:flex-col md:gap-4 w-full">
              <BuildMetrics />
              <Artifacts />
            </div>
          </aside>
        </div>
      </section>
    </section>
  );
}
