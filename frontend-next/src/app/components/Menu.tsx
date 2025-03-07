"use client";

import { AnimatePresence, motion } from "framer-motion";

import MavenDebugTools from "./MavenDebugTools";
import MavenDependencyTools from "./MavenDependencyTools";
import MavenExecutionTools from "./MavenExecutionTools";
import MavenPipeline from "./MavenPipeline";
import UserAccount from "./UserAccount";
import { useMenu } from "../store/MenuContext";

const MobileMenu = () => {
  const { isOpen, toggleMenu } = useMenu();

  return (
    <>
      {/* Prevent background scroll when menu is open */}
      {isOpen && <style>{`body { overflow: hidden; }`}</style>}

      {/* Mobile Menu Button (Top Right) */}
      <button
        className="h-20 text-3xl md:hidden text-white rounded-md fixed top-[-12] right-4 z-[10001] shadow-lg"
        onClick={toggleMenu}
        aria-label="Open Menu"
      >
        ☰
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(5px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[10000] md:hidden"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Off-Canvas Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-64 bg-gray-800 p-4 z-[10002] shadow-lg text-white overflow-y-auto"
          >
            {/* Close Button */}
            <button
              className="text-white text-xl self-end z-[10003] "
              onClick={toggleMenu}
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
