import SideBarLeft from "./components/SideBarLeft";
import MainContent from "./components/MainContent";
import RightSideBar from "./components/RightSideBar";

export default function Home() {
  return (
    <section className="flex flex-col md:flex-row w-full min-h-[100dvh] bg-gray-900 text-white pt-16">
      {/* ✅ Left Sidebar */}
      <aside className="hidden md:flex flex-col bg-gray-700 shadow-md md:w-[20%] min-w-[250px] max-h-screen overflow-y-auto pt-16">
        <SideBarLeft />
      </aside>

      {/* ✅ Main Content */}
      <div className="w-full flex-1 flex flex-col overflow-hidden pt-16">
        <MainContent />
      </div>

      {/* ✅ Right Sidebar */}
      <aside className="hidden lg:flex flex-col bg-gray-700 shadow-md md:w-[20%] min-w-[250px] max-h-screen overflow-y-auto pt-16">
        <RightSideBar />
      </aside>
    </section>
  );
}
