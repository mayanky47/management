export default function EntitiesCard({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition">
      <h2 className="font-semibold text-lg mb-4 text-gray-800">Entities</h2>
      <div className="overflow-y-auto max-h-[400px] text-sm">
        {data?.length ? (
          data.map((entity, i) => (
            <div key={i} className="border-b border-gray-100 py-1">
              <p className="font-semibold">{entity.name}</p>
              <p className="text-gray-500 text-xs">{entity.tableName || "No table specified"}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No entities detected.</p>
        )}
      </div>
    </div>
  );
}
