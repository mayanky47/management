import { Download } from "lucide-react";

export default function ExportButton({
  data,
  name,
}: {
  data: any;
  name: string;
}) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
    >
      <Download className="w-4 h-4" />
      Export JSON
    </button>
  );
}
