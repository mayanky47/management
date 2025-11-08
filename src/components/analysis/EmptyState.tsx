import { RefreshCw } from "lucide-react";

export default function EmptyState({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-20 text-gray-600">
      <p className="mb-4 text-lg">No analysis data found.</p>
      <button
        onClick={onAnalyze}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
      >
        <RefreshCw className="w-4 h-4" />
        Run Analysis
      </button>
    </div>
  );
}
