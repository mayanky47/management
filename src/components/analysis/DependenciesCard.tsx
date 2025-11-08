export default function DependenciesCard({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition">
      <h2 className="font-semibold text-lg mb-4 text-gray-800">Dependencies</h2>
      <div className="overflow-y-auto max-h-[400px] text-sm">
        {data?.length ? (
          data.map((dep, i) => (
            <div key={i} className="border-b border-gray-100 py-1">
              <p className="font-mono">{dep.groupId}:{dep.artifactId}</p>
              {dep.version && <p className="text-xs text-gray-500">v{dep.version}</p>}
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No dependencies found.</p>
        )}
      </div>
    </div>
  );
}
