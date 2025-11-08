import React from "react";

interface StatusBadgeProps {
  status?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorMap: Record<string, string> = {
    Completed: "bg-green-100 text-green-700",
    InProgress: "bg-blue-100 text-blue-700",
    Draft: "bg-gray-100 text-gray-700",
    Archived: "bg-gray-200 text-gray-500",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorMap[status || "Draft"]}`}>
      {status || "Draft"}
    </span>
  );
};

export default StatusBadge;
