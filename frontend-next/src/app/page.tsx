import SideBarLeft from "./components/SideBarLeft";
import MainContent from "./components/MainContent";
import RightSideBar from "./components/RightSideBar";

export default function Home() {
  return (
    <section
      className="w-full h-full flex flex-col md:flex-row bg-gray-900 text-white overflow-hidden"
      style={{ maxHeight: "calc(100vh - 7rem)" }} // Full height minus header/footer
    >
      {/* ✅ Left Sidebar (Static, No Scroll) */}
      <aside className="hidden md:flex flex-col items-center gap-2 bg-gray-700 shadow-md md:w-[20%] min-w-[250px] h-full">
        <SideBarLeft />
      </aside>

      {/* ✅ Main Content (Full width, Flexible) */}
      <MainContent />

      {/* ✅ Right Sidebar (Fixed width, no unnecessary spacing) */}
      <aside className="hidden lg:flex flex-col bg-gray-700 px-4 py-6 shadow-md max-w-[400px] w-full items-center">
        <RightSideBar />
      </aside>
    </section>
  );
}
