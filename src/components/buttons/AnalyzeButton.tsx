import React from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface AnalyzeButtonProps {
  loading: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ loading, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    disabled={loading}
    className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md hover:shadow-lg transition ${
      loading ? "opacity-60" : ""
    }`}
    title="Analyze Project"
  >
    {loading ? (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
      >
        <RefreshCw className="w-4 h-4" />
      </motion.div>
    ) : (
      <RefreshCw className="w-4 h-4" />
    )}
  </motion.button>
);

export default AnalyzeButton;
