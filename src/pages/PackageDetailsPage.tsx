import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Clock, Info, RefreshCw } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "../components/projects/ProjectCard";
import { PackageAPI } from "../api/packageApi";
import type { ProjectPackage } from "../types/packageTypes";
import CollapsiblePrompt from "../components/ui/CollapsiblePrompt";
import AutoSaveSection from "../components/ui/AutoSaveSection";

const PackageDetailsPage: React.FC = () => {
  const { name: packageName } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<ProjectPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const { doAnalyze } = useProjects();

  // --- For AI Context Prompt ---
  const [prompt, setPrompt] = useState("Select a project to generate its AI context.");
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  // --- Fetch package ---
  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!packageName) return;
      setLoading(true);
      try {
        const data = await PackageAPI.fetchPackageDetails(packageName);
        setPkg(data);
        setPrompt(generatePrompt(data));
      } catch (err: any) {
        toast.error(err.message || "Failed to load package.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackageDetails();
  }, [packageName]);

  // --- Analyze Project ---
  const handleAnalyzeProject = async (projectName: string) => {
    try {
      await doAnalyze(projectName);
      const updated = await PackageAPI.refreshPackage(packageName!);
      setPkg(updated);
      toast.success(`Reanalyzed "${projectName}" successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze project.");
    }
  };

  // --- Open Project ---
  const handleProjectClick = (projectName: string) =>
    navigate(`/project/${encodeURIComponent(projectName)}`);

  // --- Generate Prompt Text ---
  const generatePrompt = (data: ProjectPackage) => `
You are assisting with the "${data.name}" package.
Purpose: ${data.purpose || "N/A"}
Status: ${data.status || "N/A"}
Priority: ${data.priority || "N/A"}

Below are associated projects:
${data.projects?.map((p) => `• ${p.name} (${p.type})`).join("\n") || "No projects"}

When generating files, always include the correct file path as a comment:
Example (Spring): // src/main/java/com/example/service/MyService.java
Example (React): // src/components/ui/Button.tsx

After the first line, provide only the code body.
`;

  const handleGenerateContext = async () => {
    if (!pkg) return;
    setIsPromptLoading(true);
    try {
      const refreshed = await PackageAPI.refreshPackage(pkg.name);
      setPrompt(generatePrompt(refreshed));
      toast.success("Generated full context for package!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate context.");
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard!");
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
        >
          <RefreshCw className="w-10 h-10 text-blue-500" />
        </motion.div>
        <p className="mt-4 text-gray-600 text-sm">Fetching package details...</p>
      </div>
    );

  if (!pkg)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center">
        <Info className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-red-600 text-lg mb-2">Package not found.</p>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Packages
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <Toaster position="top-right" richColors />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>
        </div>

        {/* Package Overview */}
        <motion.div
          layout
          className="bg-white/80 backdrop-blur-lg border border-gray-100 shadow-xl rounded-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pkg.name}</h1>
          <p className="text-gray-600 mb-5">{pkg.purpose || "No description provided."}</p>

          <div className="flex flex-wrap gap-3 text-sm">
            {pkg.status && (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                Status: {pkg.status}
              </span>
            )}
            {pkg.priority && (
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">
                Priority: {pkg.priority}
              </span>
            )}
            {pkg.dueDate && (
              <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                <Clock className="w-4 h-4 mr-1" /> Due: {pkg.dueDate}
              </span>
            )}
          </div>
        </motion.div>

        {/* Projects */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Projects ({pkg.projects?.length || 0})
          </h2>
          {pkg.projects?.length ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {pkg.projects.map((project) => (
                  <ProjectCard
                    key={project.name}
                    project={project}
                    onOpen={() => handleProjectClick(project.name)}
                    onAnalyze={() => handleAnalyzeProject(project.name)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="bg-white/70 p-8 rounded-2xl border text-center text-gray-500 shadow-sm">
              No projects associated with this package.
            </div>
          )}
        </section>

        {/* --- AI Code Integration Section --- */}
        <section className="space-y-6 mt-10">
          <CollapsiblePrompt
            prompt={prompt}
            isLoading={isPromptLoading}
            onGenerateContext={handleGenerateContext}
            onCopy={handleCopyPrompt}
            disabled={!pkg.projects?.length}
          />
          <AutoSaveSection
            springProject={pkg.projects?.[1]?.name || ""}
            reactProject={pkg.projects?.[0]?.name || ""}
          />
        </section>
      </div>
    </div>
  );
};

export default PackageDetailsPage;
