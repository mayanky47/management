import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import ProjectDetailsCard from "../components/projects/ProjectDetailsCard";
import ProjectInsights from "../components/projects/ProjectInsights";
import ProjectLoadingSkeleton from "../components/projects/ProjectLoadingSkeleton";
import { ProjectAPI } from "../api/projectApi";

const ProjectPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { filtered, doDelete, doOpen } = useProjects();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingSQLite, setIsAddingSQLite] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const project = filtered.find((p) => p.name === name);

  /** 🔹 Fetch project analysis data */
  const fetchAnalysis = async () => {
    if (!project) return;
    try {
      const data = await ProjectAPI.fetchAnalysis(project.name);
      setAnalysisData(data);
    } catch (err: any) {
      console.warn(err.message || "No analysis data found yet.");
    }
  };

  useEffect(() => {
    if (project) fetchAnalysis();
  }, [project]);

  /** 🔹 Delete project */
  const handleDelete = async () => {
    if (!project || !window.confirm(`Delete "${project.name}"?`)) return;
    try {
      await ProjectAPI.deleteProject(project.name);
      await doDelete(project.name);
      toast.success(`Deleted "${project.name}"`);
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project");
    }
  };

  /** 🔹 Open project in IDE */
  const handleOpen = async () => {
    try {
      if (doOpen) {
        await doOpen(project!);
        toast.success(`Opening "${project!.name}"...`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open project");
    }
  };

  /** 🔹 Analyze project */
  const handleAnalyze = async () => {
    if (isAnalyzing || !project) return;
    setIsAnalyzing(true);
    toast.loading(`Analyzing "${project.name}"...`);
    try {
      const data = await ProjectAPI.analyzeProject(project.name);
      setAnalysisData(data);
      toast.success(`Analysis complete for "${project.name}"`);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze project");
    } finally {
      setIsAnalyzing(false);
      toast.dismiss();
    }
  };

  /** 🔹 Add SQLite dependency */
  const handleAddSQLite = async () => {
    if (isAddingSQLite || !project) return;
    setIsAddingSQLite(true);
    toast.loading(`Adding SQLite to "${project.name}"...`);
    try {
      await ProjectAPI.addSQLite(project.name);
      toast.success("SQLite added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add SQLite");
    } finally {
      setIsAddingSQLite(false);
      toast.dismiss();
    }
  };

  /** 🔹 Handle not found or loading states */
  if (!project) return <ProjectLoadingSkeleton />;

  /** 🔹 Render main content */
  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-7xl p-4 md:p-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-6"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="space-y-8">
            <ProjectDetailsCard project={project} />
            <ProjectInsights
              analysisData={analysisData}
              isAnalyzing={isAnalyzing}
              isAddingSQLite={isAddingSQLite}
              onAnalyze={handleAnalyze}
              onAddSQLite={handleAddSQLite}
              onOpen={handleOpen}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectPage;
