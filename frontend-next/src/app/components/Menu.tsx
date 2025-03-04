"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectList from "./ProjectList";
import RepoList from "./RepoList";
import Accordion from "./ui/Accordion";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Prevent background scroll when menu is open */}
      {isOpen && <style>{`body { overflow: hidden; }`}</style>}

      {/* Mobile Menu Button (Top Right) */}
      <motion.button
        className="lg:hidden text-white rounded-sm fixed top-0 right-4 z-50 shadow-lg px-2"
        onClick={() => setIsOpen(true)}
        aria-label="Open Menu"
        whileTap={{ scale: 0.9 }}
      >
        ☰
      </motion.button>

      {/* Overlay with blur effect */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(5px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Off-Canvas Menu (Right-side Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-64 bg-gray-800 p-4 z-50 shadow-lg text-white overflow-y-auto"
          >
            {/* Close Button */}
            <button
              className="text-white text-xl self-end"
              onClick={() => setIsOpen(false)}
              aria-label="Close Menu"
            >
              ✖
            </button>

            {/* Project List Accordion */}
            <Accordion title="Project List">
              <ProjectList />
            </Accordion>

            {/* Repo List Accordion */}
            <RepoList />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;
