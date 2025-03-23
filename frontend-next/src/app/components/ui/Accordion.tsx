"use client";

import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
} from "react";
import { FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import useMeasure from "react-use-measure";

export interface AccordionHandle {
  toggle: () => void;
  isOpen: () => boolean;
}

interface AccordionProps {
  title: string | ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  onClick?: () => void;
  bgColor?: string;
  hoverColor?: string;
  titleSize?: string;
  titleColor?: string;
  contentBgColor?: string;
}

const Accordion = forwardRef<AccordionHandle, AccordionProps>(
  (
    {
      title,
      children,
      defaultOpen = false,
      onClick,
      bgColor = "bg-gray-800",
      hoverColor = "hover:bg-gray-900",
      titleSize = "text-base",
      titleColor = "text-white",
      contentBgColor = "bg-gray-800",
    },
    ref
  ) => {
    const [refMeasure, { height }] = useMeasure();
    const [open, setOpen] = useState(defaultOpen);

    useImperativeHandle(ref, () => ({
      toggle: () => setOpen((prev) => !prev),
      isOpen: () => open,
    }));

    return (
      <motion.div
        animate={open ? "open" : "closed"}
        className={`w-full rounded-lg shadow-lg transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
            onClick?.();
          }}
          className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-lg ${bgColor} ${hoverColor} ${titleColor} ${titleSize} font-semibold`}
        >
          <motion.span className="w-full text-left bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </motion.span>
          <motion.span
            variants={{
              open: { rotate: 180 },
              closed: { rotate: 0 },
            }}
            transition={{ duration: 0.3 }}
            className="text-xl"
          >
            <FiChevronDown />
          </motion.span>
        </button>

        {/* Collapsible Content */}
        <motion.div
          initial={false}
          animate={{
            height: open ? height : 0,
            marginBottom: open ? 12 : 0,
          }}
          className="w-full overflow-hidden"
        >
          <div
            ref={refMeasure}
            className={`w-full px-4 py-2 ${contentBgColor} rounded-b-lg`}
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
