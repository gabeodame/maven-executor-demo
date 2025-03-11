"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useMenu } from "../store/react-context/MenuContext";
import MavenDebugTools from "./maven-executors/MavenDebugTools";
import MavenDependencyTools from "./maven-executors/MavenDependencyTools";
import MavenExecutionTools from "./maven-executors/MavenExecutionTools";
import MavenPipeline from "./maven-executors/MavenPipeline";
import UserAccount from "./UserAccount";

const MobileMenu = () => {
  const { isOpen, toggleMenu, closeMenu } = useMenu();

  return (
    <>
      {isOpen && <style>{`body { overflow: hidden; }`}</style>}

      {/* ✅ Open Menu Button (Prevents toggling issues) */}
      <button
        className="h-20 text-3xl md:hidden text-white rounded-md fixed top-[-12] right-4 z-[10001] shadow-lg"
        onClick={toggleMenu}
        aria-label="Open Menu"
      >
        ☰
      </button>

      {/* ✅ Prevents menu from closing if modal is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(5px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[10000] md:hidden"
            onClick={closeMenu} // ✅ Only closes menu, does NOT affect modal
          />
        )}
      </AnimatePresence>

      {/* ✅ Off-Canvas Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-64 bg-gray-800 p-4 z-[10002] shadow-lg text-white overflow-y-auto"
          >
            {/* ✅ Close Button (Closes Menu) */}
            <button
              className="text-white text-xl self-end z-[10004]"
              onClick={closeMenu} // ✅ Properly closes menu without affecting modal
              aria-label="Close Menu"
            >
              ✖
            </button>

            <UserAccount />
            <MavenDependencyTools />
            <MavenDebugTools />
            <MavenExecutionTools />
            <MavenPipeline />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;
