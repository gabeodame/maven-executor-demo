import SideBarLeft from "./components/SideBarLeft";
import MainContent from "./components/MainContent";
import RightSideBar from "./components/RightSideBar";

export default function Home() {
  return (
    <section className="w-full h-full flex flex-col md:flex-row bg-gray-900 text-white overflow-hidden">
      {/* ✅ Left Sidebar (Fixed, No Scroll) */}
      <aside className="hidden md:flex flex-col bg-gray-700 shadow-md md:w-[20%] min-w-[250px] h-full">
        <SideBarLeft />
      </aside>

      {/* ✅ Main Content (Flexible, Scrollable) */}
      <MainContent />

      {/* ✅ Right Sidebar (Hidden on Mobile, Fixed on Desktop) */}
      <aside className="hidden lg:flex flex-col bg-gray-700 px-4 py-6 shadow-md max-w-[400px] w-full items-center">
        <RightSideBar />
      </aside>
    </section>
  );
}
