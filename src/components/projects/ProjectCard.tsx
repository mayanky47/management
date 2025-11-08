import React, { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Flame } from "lucide-react";
import { toast } from "sonner";
import AnalyzeButton from "../buttons/AnalyzeButton";
import type { Project } from "../../types/packageTypes";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onAnalyze: () => Promise<void>;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen, onAnalyze }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const hasApiData = project.apiMetadata && project.apiMetadata.length > 2;
  const hasCompData = project.componentMetadata && project.componentMetadata.length > 2;

  const handleAnalyzeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    toast.loading(`Analyzing "${project.name}"...`);
    try {
      await onAnalyze();
      toast.success(`Analysis complete for "${project.name}"!`);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
      toast.dismiss();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onOpen}
      className="bg-white/70 backdrop-blur-lg border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl cursor-pointer transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{project.name}</h4>
          <p className="text-sm text-blue-600 font-medium mt-0.5">{project.type}</p>
        </div>
        <AnalyzeButton loading={isAnalyzing} onClick={handleAnalyzeClick} />
      </div>

      <div className="flex items-center text-gray-500 text-xs mt-3">
        <GitBranch className="w-4 h-4 mr-1" />
        <span>{project.path || "Path not set"}</span>
      </div>

      {(hasApiData || hasCompData) && (
        <div className="mt-3 flex items-center text-xs text-green-700 font-medium bg-green-50 px-2 py-1 rounded-lg w-fit">
          <Flame className="w-3 h-3 mr-1" /> Analysis complete
        </div>
      )}
    </motion.div>
  );
};

export default ProjectCard;
