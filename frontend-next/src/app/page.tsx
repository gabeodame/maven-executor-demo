import SideBarLeft from "./components/SideBarLeft";
import MainContent from "./components/MainContent";
import RightSideBar from "./components/RightSideBar";

export default function Home() {
  return (
    <section className="w-full h-full flex flex-col md:flex-row bg-gray-900 text-white overflow-hidden">
      {/* ✅ Left Sidebar (Scrollable) */}
      <aside className="hidden md:flex flex-col bg-gray-700 shadow-md md:w-[20%] min-w-[250px] h-full overflow-y-auto">
        <SideBarLeft />
      </aside>

      {/* ✅ Main Content (Flexible, Scrollable) */}
      <div className="w-full flex-1 flex flex-col overflow-hidden">
        {/* <div className="w-full min-h-[60px]">
          <Executor />
        </div> */}
        <MainContent />
      </div>

      {/* ✅ Right Sidebar (Scrollable like Left Sidebar) */}
      <aside className="hidden lg:flex flex-col bg-gray-700 shadow-md md:w-[20%] min-w-[250px] h-full overflow-y-auto">
        <RightSideBar />
      </aside>
    </section>
  );
}
