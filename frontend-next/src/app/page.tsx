import Artifacts from "./components/Artifacts";
import BuildMetrics from "./components/BuildMetrics";
import ConsoleOutput from "./components/ConsoleOutput";
import Executor from "./components/Executor";

import ProjectList from "./components/ProjectList";
import RepoList from "./components/RepoList";

{
  /* <section
      className="w-full bg-gray-900 text-white flex flex-col 
         md:grid md:grid-cols-[minmax(16rem,20%)_minmax(0,80%)] 
         lg:grid-cols-[minmax(16rem,20%)_minmax(60%,60%)_minmax(40%,40%)]"
      style={{ minHeight: "calc(100vh - 7rem)" }} // Full height minus header/footer
    ></section> */
}

export default function Home() {
  return (
    <section
      className="w-full flex flex-col md:flex-row bg-gray-900 text-white"
      style={{ minHeight: "calc(100vh - 7rem)" }} // Full height minus header/footer
    >
      {/* Left Sidebar (Full Height on md+) */}
      <aside className="hidden md:flex bg-gray-700 p-4 shadow-md md:w-[20%] min-w-[250px] min-h-full">
        <ProjectList />
      </aside>

      {/* Main Section (60%) */}
      <section className="flex flex-col gap-6 p-4 w-full overflow-hidden">
        <div className="w-full flex flex-col lg:grid lg:grid-cols-[60%_40%] gap-6">
          {/* Left side of Main (Buttons & Console Output) */}
          <div className="flex flex-col gap-6 w-full">
            {/* Maven Buttons */}
            <Executor />

            {/* Console Output */}
            <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col flex-1 overflow-hidden">
              <h3 className="text-lg font-semibold text-center mb-2">
                Console Output
              </h3>
              <div className="flex-1 overflow-y-auto bg-gray-900 p-3 rounded-md">
                <ConsoleOutput />
              </div>
            </div>
          </div>

          {/* Right Sidebar (40%) */}
          <aside
            className="bg-gray-700 px-2 shadow-md w-full md:w-full md:mt-6 lg:mt-0 
                      lg:w-full flex flex-col gap-4 overflow-hidden"
          >
            {/* Scrollable Inner Content */}
            <div className="overflow-y-auto p-2 flex-1 flex flex-col gap-4 w-full">
              <div className="hidden lg:flex w-full mb-2">
                <RepoList />
              </div>

              {/* Ensures full width stacking on `md` and flex side-by-side on `lg+` */}
              <div className="flex flex-col md:flex-row lg:flex-col md:gap-4 w-full">
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
