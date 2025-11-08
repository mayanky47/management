import React from "react";

const colorMap: Record<string, string> = {
  gray: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
  emerald: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
  purple: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
  blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  red: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
};

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  color,
  onClick,
  disabled,
}) => {
  const colorClasses = colorMap[color] || colorMap.gray;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses} ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;
