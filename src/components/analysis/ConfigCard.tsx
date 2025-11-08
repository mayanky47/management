export default function ConfigCard({ data }: { data: Record<string, string> }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition">
      <h2 className="font-semibold text-lg mb-4 text-gray-800">Configuration</h2>
      <div className="overflow-y-auto max-h-[400px] text-sm">
        {data && Object.keys(data).length ? (
          Object.entries(data).map(([key, value], i) => (
            <div key={i} className="flex justify-between border-b border-gray-100 py-1">
              <span className="font-mono text-gray-700">{key}</span>
              <span className="text-gray-500 truncate max-w-[50%]">{value}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No configuration found.</p>
        )}
      </div>
    </div>
  );
}
