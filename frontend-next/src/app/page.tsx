import BuildMetrics from "./components/BuildMetrics";
import ConsoleOutput from "./components/ConsoleOutput";
import Executor from "./components/Executor";

// import RepoList from "./components/RepoList";
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
      <section className="h-full flex flex-col gap-6 p-4 w-full overflow-hidden">
        <div className="w-full h-full flex flex-col p-2 lg:grid lg:grid-cols-[60%_40%] gap-6 overflow-hidden">
          {/* ✅ Left Side (Executor Fixed, Console Grows) */}
          <div className="flex flex-col gap-6 w-full overflow-hidden">
            {/* ✅ Maven Executor (Fixed at the Top) */}
            <div className="shrink-0 min-h-[60px]">
              <Executor />
            </div>

            {/* ✅ Scrollable Section for Mobile/Tablets */}
            <div className="flex-1 overflow-y-auto lg:overflow-visible">
              {/* ✅ Console Output (Takes Full Remaining Height) */}
              <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col flex-1">
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

          {/* ✅ Right Sidebar (Floated Right on Desktop, Doesn't Scroll) */}
          {/* ✅ Right Sidebar (Floated Right on Desktop, Doesn't Scroll) */}
          <aside className="hidden lg:flex bg-gray-700 px-4 py-6 shadow-md w-full max-w-[400px] mx-auto lg:mt-0 flex-col items-center gap-6">
            {/* 📌 Centered Metrics & Artifacts */}
            <div className="flex flex-col items-center gap-6 w-full max-w-[400px]">
              <BuildMetrics />
              <Artifacts />
            </div>
          </aside>
        </div>
      </section>
    </section>
  );
}
