"use client";

import React, { useState, useImperativeHandle, forwardRef } from "react";
import { FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import useMeasure from "react-use-measure";

// ✅ Define the props for the Accordion
interface AccordionProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onClick?: () => void;
  bgColor?: string;
  hoverColor?: string;
  setBgColor?: (color: string) => void;
  titleSize?: string;
  titleColor?: string;
  contentBgColor?: string;
}

// ✅ Define the ref type (exposing `toggle` and `isOpen`)
export interface AccordionHandle {
  toggle: () => void;
  isOpen: () => boolean;
}

// ✅ Forward the ref so parent components can control it
const Accordion = forwardRef<AccordionHandle, AccordionProps>(
  (
    {
      title,
      children,
      defaultOpen = false,
      onClick,
      bgColor = "bg-gray-800",
      hoverColor = "bg-gray-900",
      titleSize = "",
      titleColor = "text-white",
      contentBgColor = "bg-gray-800",
    },
    ref
  ) => {
    const [refMeasure, { height }] = useMeasure();
    const [open, setOpen] = useState(defaultOpen);

    // ✅ Expose methods via ref

    useImperativeHandle(ref, () => ({
      toggle: () => setOpen((prev) => !prev),
      isOpen: () => open,
      bgColor,
    }));

    return (
      <motion.div
        animate={open ? "open" : "closed"}
        className={`${bgColor} ${hoverColor} ${titleSize} ${titleColor} rounded-lg shadow-lg ease-in-out transition-all`}
      >
        {/* Accordion Header */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
            onClick?.(); // ✅ Trigger external onClick (API fetch)
          }}
          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-white font-medium rounded-lg transition cursor-pointer"
        >
          <motion.span
            variants={{
              open: { color: "rgb(147, 197, 253)" },
              closed: { color: "rgb(255, 255, 255)" },
            }}
            className="w-full bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-left"
          >
            {title}
          </motion.span>
          <motion.span
            variants={{
              open: { rotate: "180deg", color: "rgb(147, 197, 253)" },
              closed: { rotate: "0deg", color: "rgb(255, 255, 255)" },
            }}
            className="text-xl"
          >
            <FiChevronDown />
          </motion.span>
        </button>

        {/* Accordion Content */}
        <motion.div
          initial={false}
          animate={{
            height: open ? height : 0,
            marginBottom: open ? "12px" : "0px",
          }}
          className="overflow-hidden text-gray-300"
        >
          <div
            ref={refMeasure}
            className={`px-4 py-2 ${contentBgColor} rounded-b-lg`}
          >
            {children}
          </div>
        </motion.div>
      </motion.div>
    );
  }
);

Accordion.displayName = "Accordion";
export default Accordion;
