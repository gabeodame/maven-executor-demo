import React from "react";

interface MavenButtonProps {
  command: string;
  onClick: () => void;
  disabled: boolean;
}

const getButtonClasses = (cmd: string, disabled: boolean) => {
  const baseClasses =
    "px-4 py-2 text-white text-sm sm:text-base md:text-lg font-medium rounded-md transition-all duration-200";
  const disabledClasses = "bg-gray-500 cursor-not-allowed opacity-70";

  const colorClasses = disabled
    ? disabledClasses
    : cmd === "clean"
    ? "bg-blue-600 hover:bg-blue-700"
    : cmd === "compile"
    ? "bg-green-600 hover:bg-green-700"
    : cmd === "package"
    ? "bg-yellow-600 hover:bg-yellow-700 text-black"
    : cmd === "validate"
    ? "bg-teal-600 hover:bg-teal-700"
    : "bg-red-600 hover:bg-red-700";

  return `${baseClasses} ${colorClasses}`;
};

const MavenButton = ({ command, onClick, disabled }: MavenButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${getButtonClasses(
        command,
        disabled
      )} w-full sm:w-auto min-w-[100px] max-w-[180px] flex-1`}
    >
      Maven {command.charAt(0).toUpperCase() + command.slice(1)}
    </button>
  );
};

export default MavenButton;
