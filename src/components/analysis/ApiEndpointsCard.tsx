import { motion } from "framer-motion";

export default function ApiEndpointsCard({ data }: { data: any[] }) {
  return (
    <motion.div
      layout
      className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition"
    >
      <h2 className="font-semibold text-lg mb-4 text-gray-800">API Endpoints</h2>
      <div className="overflow-y-auto max-h-[400px] text-sm space-y-2">
        {data?.length ? (
          data.map((api, i) => (
            <div
              key={i}
              className="border-b border-gray-100 py-1 flex justify-between items-center"
            >
              <span className="font-mono text-gray-700">{api.path}</span>
              <span className="text-xs font-semibold bg-gray-200 px-2 py-1 rounded">
                {api.httpMethod}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No endpoints found.</p>
        )}
      </div>
    </motion.div>
  );
}
