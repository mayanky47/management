// src/components/packages/CreatePackageModal.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ALL_PACKAGE_STATUSES, ALL_PRIORITIES, API_BASE } from "../../constants/packageConstants";
import { Loader2 } from "lucide-react";

interface Project {
  name: string;
  type: string;
}

interface ProjectPackage {
  name: string;
  purpose?: string;
  status?: string;
  priority?: string;
  projects?: Project[];
}

interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (pkg: ProjectPackage) => void;
}

const CreatePackageModal: React.FC<CreatePackageModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [newPackageData, setNewPackageData] = useState<ProjectPackage>({
    name: "",
    purpose: "",
    status: ALL_PACKAGE_STATUSES[0],
    priority: ALL_PRIORITIES[0],
    projects: [],
  });

  const [newProject, setNewProject] = useState<Project>({ name: "", type: "React" });
  const [existingProjects, setExistingProjects] = useState<Project[]>([]);
  const [selectedExistingProject, setSelectedExistingProject] = useState<string>("");
  const [includeDefaults, setIncludeDefaults] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);

  /** 🔹 Fetch all existing projects for reuse */
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await fetch(`${API_BASE}/projects`);
        if (!res.ok) throw new Error("Failed to fetch projects.");
        const data = await res.json();
        setExistingProjects(data);
      } catch (err: any) {
        toast.error(err.message || "Unable to load existing projects.");
      } finally {
        setLoadingProjects(false);
      }
    };

    if (isOpen) fetchProjects();
  }, [isOpen]);

  /** 🔹 Add new project to package */
  const addProjectToPackage = () => {
    if (!newProject.name.trim()) return toast.error("Project name required.");
    setNewPackageData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProject],
    }));
    setNewProject({ name: "", type: "React" });
  };

  /** 🔹 Add existing project to package */
  const addExistingProject = () => {
    if (!selectedExistingProject) return toast.error("Select an existing project first.");
    const project = existingProjects.find((p) => p.name === selectedExistingProject);
    if (!project) return toast.error("Project not found.");
    if (newPackageData.projects?.some((p) => p.name === project.name))
      return toast.error("This project is already added.");

    setNewPackageData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), project],
    }));
    setSelectedExistingProject("");
  };

  /** 🔹 Create package with chosen options */
  const createPackage = async () => {
    if (!newPackageData.name.trim()) return toast.error("Package name required.");

    let finalProjects = [...(newPackageData.projects || [])];

    if (includeDefaults) {
      finalProjects = [
        { name: `${newPackageData.name}-frontend`, type: "React" },
        { name: `${newPackageData.name}-backend`, type: "Spring" },
        ...finalProjects,
      ];
    }

    const dataToSend = { ...newPackageData, projects: finalProjects };

    try {
      const res = await fetch(`${API_BASE}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        const created = await res.json();
        onCreated(created);
        toast.success(`Package '${created.name}' created successfully!`);
        onClose();
      } else {
        toast.error("Failed to create package.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Create New Package</h2>

            {/* Package Details */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Package Name"
                className="w-full border border-gray-300 p-3 rounded-lg"
                value={newPackageData.name}
                onChange={(e) =>
                  setNewPackageData({ ...newPackageData, name: e.target.value })
                }
              />

              <textarea
                placeholder="Purpose / Description"
                className="w-full border border-gray-300 p-3 rounded-lg resize-none"
                rows={3}
                value={newPackageData.purpose}
                onChange={(e) =>
                  setNewPackageData({ ...newPackageData, purpose: e.target.value })
                }
              />

              <div className="flex gap-3">
                <select
                  value={newPackageData.status}
                  onChange={(e) =>
                    setNewPackageData({ ...newPackageData, status: e.target.value })
                  }
                  className="border border-gray-300 p-3 rounded-lg flex-1"
                >
                  {ALL_PACKAGE_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={newPackageData.priority}
                  onChange={(e) =>
                    setNewPackageData({ ...newPackageData, priority: e.target.value })
                  }
                  className="border border-gray-300 p-3 rounded-lg flex-1"
                >
                  {ALL_PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Default App Toggle */}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={includeDefaults}
                  onChange={() => setIncludeDefaults(!includeDefaults)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  Include default projects (frontend + backend)
                </span>
              </div>
            </div>

            {/* Add Existing Project */}
            <div className="mt-5 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Attach Existing Project</h3>
              <div className="flex gap-2">
                <select
                  value={selectedExistingProject}
                  onChange={(e) => setSelectedExistingProject(e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg flex-1"
                >
                  <option value="">Select project...</option>
                  {loadingProjects ? (
                    <option>Loading...</option>
                  ) : (
                    existingProjects.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({p.type})
                      </option>
                    ))
                  )}
                </select>
                <button
                  onClick={addExistingProject}
                  className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Add New Project */}
            <div className="mt-4 border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Add New Project</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Project Name"
                  className="border border-gray-300 p-2 rounded-lg flex-1"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                />
                <select
                  value={newProject.type}
                  onChange={(e) =>
                    setNewProject({ ...newProject, type: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded-lg"
                >
                  <option>React</option>
                  <option>Spring</option>
                  <option>Other</option>
                </select>
                <button
                  onClick={addProjectToPackage}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                >
                  Add
                </button>
              </div>

              {/* Project List */}
              <div className="bg-gray-50 border rounded-lg p-2 max-h-32 overflow-y-auto">
                {newPackageData.projects?.length ? (
                  newPackageData.projects.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between bg-white px-2 py-1 mb-1 rounded-md shadow-sm text-sm"
                    >
                      <span>{p.name}</span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {p.type}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No projects added yet.</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={createPackage}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
              >
                Create Package
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePackageModal;
