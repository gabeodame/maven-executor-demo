import BuildMetrics from "./components/BuildMetrics";
import ConsoleOutput from "./components/ConsoleOutput";
import Executor from "./components/Executor";

import RepoList from "./components/RepoList";
import Artifacts from "./components/Artifacts";
import SideBarLeft from "./components/SideBarLeft";

export default function Home() {
  return (
    <section
      className="w-full h-full flex flex-col md:flex-row bg-gray-900 text-white"
      style={{ maxHeight: "calc(100vh - 7rem)" }} // Full height minus header/footer
    >
      {/* ✅ Left Sidebar (Static, No Scroll) */}
      <aside className="hidden md:flex flex-col items-center gap-2 bg-gray-700 shadow-md md:w-[20%] min-w-[250px] h-full">
        <SideBarLeft />
      </aside>

      {/* ✅ Main Section (Scrolls fully) */}
      <section className="h-full flex flex-col gap-6 p-4 w-full overflow-y-auto">
        <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-[60%_40%] gap-6">
          {/* ✅ Left Side (Executor & Console Output) */}
          <div className="flex flex-col gap-6 w-full">
            {/* Maven Executor */}
            <Executor />

            {/* ✅ Console Output (Independently Scrolls) */}
            <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col flex-1 min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
              <h3 className="text-lg font-semibold text-center mb-2">
                Console Output
              </h3>
              <div className="flex-1  overflow-auto bg-gray-900 p-3 rounded-md">
                <ConsoleOutput />
              </div>
            </div>
          </div>

          {/* ✅ Right Sidebar (Expands & Scrolls with Main Section) */}
          <aside className="bg-gray-700 px-2 shadow-md w-full md:w-full md:mt-6 lg:mt-0 lg:w-full flex flex-col gap-4">
            {/* 📌 Scrollable Inner Content */}
            <div className="overflow-y-auto p-2 flex-1 flex flex-col gap-4 w-full">
              {/* Repo List (Hidden on mobile, shown on lg+) */}
              <div className="hidden lg:flex w-full mb-2">
                <RepoList />
              </div>

              {/* 📌 Metrics & Artifacts (Flows with Main Content) */}
              <div className="flex flex-col md:flex-row gap-4 lg:flex-col md:gap-4 w-full">
                <BuildMetrics />
                <Artifacts />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </section>
  );
}
