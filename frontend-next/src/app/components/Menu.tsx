"use client";
import React, { useState } from "react";

import ProjectList from "./ProjectList";
import RepoList from "./RepoList";
import Accordion from "./ui/Accordion";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button (Top Right) */}
      <button
        className="md:hidden  bg-gray-800 text-white rounded-md fixed top-0 right-4 z-50 shadow-lg"
        onClick={() => setIsOpen(true)}
        aria-label="Open Menu"
      >
        ☰
      </button>

      {/* Background Overlay (Click to Close) */}
      {isOpen && (
        <div
          className="fixed inset-0  bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Off-Canvas Menu (Right-side Drawer) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-800 p-4 z-50 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform md:hidden shadow-lg`}
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
      </div>
    </>
  );
};

export default MobileMenu;
