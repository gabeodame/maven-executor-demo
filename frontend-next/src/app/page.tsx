import Artifacts from "./components/Artifacts";
import BuildMetrics from "./components/BuildMetrics";
import ConsoleOutput from "./components/ConsoleOutput";
import Executor from "./components/Executor";
import SideBarLeft from "./components/SideBarLeft";

export default function Home() {
  return (
    <section className="w-full flex flex-col md:flex-row bg-gray-900 text-white h-screen overflow-hidden">
      {/* ✅ Sidebar with ARIA role */}
      <aside
        className="w-1/4 bg-gray-800 p-4 h-full overflow-y-auto"
        role="complementary"
      >
        <SideBarLeft />
      </aside>

      {/* ✅ Main Content */}
      <main
        className="flex flex-col gap-6 p-4 w-full h-full overflow-y-auto"
        role="main"
      >
        <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-[60%_40%] gap-6">
          {/* ✅ Left side */}
          <article
            className="flex flex-col gap-6 w-full"
            role="article"
            aria-labelledby="executor-title"
          >
            <h2 id="executor-title" className="sr-only">
              Maven Command Execution
            </h2>
            <Executor />

            {/* ✅ Console Output */}
            <section className="w-full bg-gray-800 p-4 rounded-lg shadow-md flex flex-col flex-1 min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
              <h3 className="text-lg font-semibold text-center mb-2">
                Console Output
              </h3>
              <div className="flex flex-col flex-grow w-full p-4">
                <ConsoleOutput />
              </div>
            </section>
          </article>

          {/* ✅ Right Sidebar */}
          <aside
            className="bg-gray-700 px-2 shadow-md w-full md:w-full md:mt-6 lg:mt-0 lg:w-full flex flex-col gap-4"
            role="complementary"
          >
            {/* Build Metrics & Artifacts */}
            <div className="flex flex-col md:flex-row lg:flex-col md:gap-4 w-full">
              <BuildMetrics />
              <Artifacts />
            </div>
          </aside>
        </div>
      </main>
    </section>
  );
}
