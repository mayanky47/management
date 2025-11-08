import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  RefreshCw,
  ArrowLeft,
  FileCode2,
  Database,
  ListTree,
  Settings,
  Download,
} from "lucide-react";

import ApiEndpointsCard from "../components/analysis/ApiEndpointsCard";
import EntitiesCard from "../components/analysis/EntitiesCard";
import DependenciesCard from "../components/analysis/DependenciesCard";
import ConfigCard from "../components/analysis/ConfigCard";
import AnalysisTabs from "../components/analysis/AnalysisTabs";
import ExportButton from "../components/analysis/ExportButton";
import EmptyState from "../components/analysis/EmptyState";

export default function AnalysisDashboard() {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("api");

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${name}/analysis`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
      toast.success("Analysis data loaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch analysis");
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    toast.loading("Running analysis...");
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${name}/analyze/spring`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      toast.dismiss();
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [name]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Analysis — <span className="text-blue-600">{name}</span>
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Analyze
          </button>

          {data && <ExportButton data={data} name={name} />}
        </div>
      </header>

      {loading ? (
        <p className="text-gray-600 p-6">Analyzing project...</p>
      ) : data ? (
        <>
          <AnalysisTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6"
          >
            {activeTab === "api" && <ApiEndpointsCard data={data.apiEndpoints} />}
            {activeTab === "entities" && <EntitiesCard data={data.entities} />}
            {activeTab === "dependencies" && <DependenciesCard data={data.dependencies} />}
            {activeTab === "config" && <ConfigCard data={data.configuration} />}
          </motion.div>
        </>
      ) : (
        <EmptyState onAnalyze={runAnalysis} />
      )}
    </div>
  );
}
