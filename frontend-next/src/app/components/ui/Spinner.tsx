"use client";

import { cn } from "@/lib/utils"; // Utility function for Tailwind class merging

interface SpinnerProps {
  size?: "sm" | "md" | "lg"; // Default is `md`
  color?: "cyan" | "blue" | "white"; // Default is `cyan`
  className?: string; // Extra Tailwind classes if needed
}

const sizeMap = {
  sm: "w-6 h-6 border-2",
  md: "w-10 h-10 border-4",
  lg: "w-14 h-14 border-4",
};

const colorMap = {
  cyan: "border-cyan-500 border-t-transparent",
  blue: "border-blue-500 border-t-transparent",
  white: "border-white border-t-transparent",
};

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "cyan",
  className,
}) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={cn(
          "animate-spin rounded-full border-solid",
          sizeMap[size],
          colorMap[color],
          className
        )}
      />
    </div>
  );
};

export default Spinner;
