import { FileCode2, Database, ListTree, Settings } from "lucide-react";

const tabs = [
  { key: "api", label: "API Endpoints", icon: FileCode2 },
  { key: "entities", label: "Entities", icon: Database },
  { key: "dependencies", label: "Dependencies", icon: ListTree },
  { key: "config", label: "Configuration", icon: Settings },
];

export default function AnalysisTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="flex gap-3 border-b border-gray-200 pb-2">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition font-medium ${
            activeTab === key
              ? "bg-white shadow text-blue-600 border border-gray-200 border-b-0"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
