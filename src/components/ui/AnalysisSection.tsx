import React from "react";

interface AnalysisSectionProps<T> {
  title: string;
  icon: React.ReactNode;
  items: T[];
  formatter: (item: T) => string;
}

function AnalysisSection<T>({
  title,
  icon,
  items,
  formatter,
}: AnalysisSectionProps<T>) {
  if (!items?.length)
    return (
      <div>
        <div className="flex items-center gap-2 mb-2 text-gray-800 font-semibold">
          {icon}
          <h3>{title}</h3>
        </div>
        <p className="text-gray-400 italic text-sm">No {title.toLowerCase()} found.</p>
      </div>
    );

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-gray-800 font-semibold">
        {icon}
        <h3>{title}</h3>
        <span className="ml-auto text-sm text-gray-500">{items.length}</span>
      </div>
      <div className="border rounded-lg bg-gray-50 p-2 text-sm max-h-60 overflow-y-auto">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="font-mono text-gray-700 bg-white p-1.5 mb-1 rounded shadow-sm"
          >
            {formatter(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnalysisSection;
