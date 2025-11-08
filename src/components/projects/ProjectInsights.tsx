import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { toast } from "sonner";
import {
  RefreshCw,
  Database,
  FolderOpen,
  Edit,
  Trash2,
  Zap,
  LayoutGrid,
  BookOpen,
  Settings,
  FileCode2,
  ListTree,
} from "lucide-react";
import TabButton from "../ui/TabButton";
import ActionButton from "../ui/ActionButton";
import AnalysisSection from "../ui/AnalysisSection";

type InsightTab = "actions" | "overview" | "api" | "config";

interface ProjectInsightsProps {
  analysisData: any;
  isAnalyzing: boolean;
  isAddingSQLite: boolean;
  onAnalyze: () => void;
  onAddSQLite: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

const ProjectInsights: React.FC<ProjectInsightsProps> = ({
  analysisData,
  isAnalyzing,
  isAddingSQLite,
  onAnalyze,
  onAddSQLite,
  onOpen,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<InsightTab>("actions");

  return (
    <div className="bg-white rounded-2xl shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 md:px-8">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 -mb-px">
          <TabButton
            label="Quick Actions"
            icon={<Zap className="w-4 h-4" />}
            isActive={activeTab === "actions"}
            onClick={() => setActiveTab("actions")}
          />
          <TabButton
            label="Overview"
            icon={<LayoutGrid className="w-4 h-4" />}
            isActive={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            disabled={!analysisData}
          />
          <TabButton
            label="Interactive API"
            icon={<BookOpen className="w-4 h-4" />}
            isActive={activeTab === "api"}
            onClick={() => setActiveTab("api")}
            disabled={!analysisData?.projectUrl}
          />
          <TabButton
            label="Configuration"
            icon={<Settings className="w-4 h-4" />}
            isActive={activeTab === "config"}
            onClick={() => setActiveTab("config")}
            disabled={!analysisData?.configuration}
          />
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-4 md:p-6"
        >
          {activeTab === "actions" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionButton
                label={isAnalyzing ? "Analyzing..." : "Re-Analyze Project"}
                icon={<RefreshCw className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />}
                onClick={onAnalyze}
                color="gray"
                disabled={isAnalyzing}
              />
              <ActionButton
                label={isAddingSQLite ? "Adding SQLite..." : "Add SQLite Support"}
                icon={<Database className={`w-4 h-4 ${isAddingSQLite ? "animate-pulse" : ""}`} />}
                onClick={onAddSQLite}
                color="emerald"
                disabled={isAddingSQLite}
              />
              <ActionButton
                label="Open Project in Editor"
                icon={<FolderOpen className="w-4 h-4" />}
                onClick={onOpen}
                color="purple"
              />
              <ActionButton
                label="Edit Project Details"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => toast.info("Edit modal not yet implemented.")}
                color="blue"
              />
              <ActionButton
                label="Delete Project"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={onDelete}
                color="red"
              />
            </div>
          )}

          {activeTab === "overview" && analysisData && (
            <div className="space-y-6">
              <AnalysisSection
                title="API Endpoints"
                icon={<FileCode2 className="w-5 h-5" />}
                items={analysisData.apiEndpoints}
                formatter={(e: any) => `${e.httpMethod} ${e.path} (${e.controller || "Unknown"})`}
              />
              <AnalysisSection
                title="Entities"
                icon={<Database className="w-5 h-5" />}
                items={analysisData.entities}
                formatter={(e: any) =>
                  `${e.name}${e.tableName ? ` → ${e.tableName}` : ""}`
                }
              />
              <AnalysisSection
                title="Dependencies"
                icon={<ListTree className="w-5 h-5" />}
                items={analysisData.dependencies}
                formatter={(d: any) =>
                  `${d.groupId}:${d.artifactId}${d.version ? `:${d.version}` : ""}`
                }
              />
            </div>
          )}

          {activeTab === "api" && analysisData?.projectUrl && (
            <div className="swagger-ui-container rounded-lg shadow-inner border bg-gray-50 p-2">
              <SwaggerUI url={`${analysisData.projectUrl}/v3/api-docs`} />
            </div>
          )}

          {activeTab === "config" && analysisData?.configuration && (
            <AnalysisSection
              title="Configuration"
              icon={<Settings className="w-5 h-5" />}
              items={Object.entries(analysisData.configuration || {})}
              formatter={([key, val]: [string, string]) => `${key} = ${val}`}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProjectInsights;
