import React, { useState, useMemo } from "react";
import type { Project } from "../types";
import { useProjects } from "../utils/UtilsAndHooks";
import ProjectDashboard from "../components/ProjectDashboard";
import ProjectDetailView from "../views/ProjectDetailView";
import { ProjectForm } from "../components/Forms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import NavigationHeader from "../components/layout/NavigationHeader";
import { useLocation } from "react-router-dom";

const ProjectPlannerPage: React.FC = () => {
  const location = useLocation();
  const { projects, isLoading, error, saveProject, deleteProject, fetchProjects } = useProjects();

  const [currentView, setCurrentView] = useState<"DASHBOARD" | "DETAIL">("DASHBOARD");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Partial<Project> | null>(null);

  const handleSelectProject = (id: number) => {
    setSelectedProjectId(id);
    setCurrentView("DETAIL");
  };

  const handleBackToDashboard = () => {
    setSelectedProjectId(null);
    setCurrentView("DASHBOARD");
  };

  const handleEditProject = (project: Partial<Project>) => {
    setProjectToEdit(project);
    setShowProjectForm(true);
  };

  const handleNewProject = () => {
    setProjectToEdit({});
    setShowProjectForm(true);
  };

  const handleSaveProjectForm = async (data: Partial<Project>) => {
    console.log("Saving project data:", data);
    await saveProject(data);
    setShowProjectForm(false);
    setProjectToEdit(null);
    await fetchProjects(); // Refresh after save
  };

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const renderContent = () => {
    if (isLoading && projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center pt-20 text-xl text-slate-500">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4" />
          Loading projects...
        </div>
      );
    }

    if (error) {
      return (
        <div className="m-6 rounded-lg bg-red-100 p-4 text-center text-red-700">{error}</div>
      );
    }

    if (currentView === "DETAIL" && selectedProject) {
      return (
        <ProjectDetailView
          project={selectedProject}
          onBack={handleBackToDashboard}
          onSelectProject={handleSelectProject}
          onEditProject={handleEditProject}
          onDeleteProject={deleteProject}
        />
      );
    }

    return (
      <ProjectDashboard
        projects={projects}
        onSelectProject={handleSelectProject}
        onEditProject={handleEditProject}
        onDeleteProject={deleteProject}
        onNewProject={handleNewProject}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ✅ Reusable top navigation (like Diary & Packages) */}
      <NavigationHeader activePath={location.pathname} />

      {/* --- Page Header --- */}
    

      {/* --- Page Content --- */}
      <main className="mx-auto max-w-7xl pb-12">{renderContent()}</main>

      {/* --- Project Form Modal --- */}
      {showProjectForm && (
        <ProjectForm
          project={projectToEdit}
          onSave={handleSaveProjectForm}
          onCancel={() => {
            setShowProjectForm(false);
            setProjectToEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectPlannerPage;
