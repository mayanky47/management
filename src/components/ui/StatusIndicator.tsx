import React from "react";

export type StatusType = "idle" | "saving" | "saved" | "error";

export const StatusIndicator: React.FC<{ status: StatusType; message: string }> = ({
  status,
  message,
}) => {
  const color =
    status === "saving"
      ? "text-blue-500"
      : status === "saved"
      ? "text-green-500"
      : status === "error"
      ? "text-red-500"
      : "text-gray-500";

  return <div className={`text-sm ${color} transition-colors duration-200`}>{message}</div>;
};
