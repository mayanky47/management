import React from "react";

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon,
  isActive,
  onClick,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 py-4 px-1 font-medium text-sm transition-colors
      ${
        isActive
          ? "border-b-2 border-purple-600 text-purple-600"
          : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
      }
      ${disabled ? "opacity-40 cursor-not-allowed" : ""}
    `}
  >
    {icon}
    {label}
  </button>
);

export default TabButton;
