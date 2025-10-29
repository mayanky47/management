import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom'; // <-- Added useLocation
import { Toaster, toast } from 'sonner';
import { Plus, ListChecks, LayoutDashboard } from 'lucide-react'; 

// --- INTERFACE DEFINITIONS ---
interface Project {
  name: string;
  type: string;
  path?: string;
}

interface ProjectPackage {
  name: string;
  purpose?: string;
  status?: string; // e.g., 'Draft', 'InProgress', 'Completed'
  priority?: string; // e.g., 'High', 'Medium', 'Low'
  dueDate?: string;
  projects?: Project[];
}

// --- CONSTANTS ---
const API_BASE = "http://localhost:8080/api";
const ALL_PACKAGE_STATUSES = ['Draft', 'InProgress', 'Completed', 'Archived'];
const ALL_PRIORITIES = ['High', 'Medium', 'Low'];

// --- COMPONENTS ---

// Simple Card Component for a Project Package
const PackageCard: React.FC<{ pkg: ProjectPackage; onOpen: () => void }> = ({ pkg, onOpen }) => (
    <div 
        className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
        onClick={onOpen}
    >
        <h3 className="text-xl font-bold text-gray-800 truncate">{pkg.name}</h3>
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
            pkg.status === 'Completed' ? 'bg-green-100 text-green-800' :
            pkg.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-600'
        }`}>
            {pkg.status || 'Draft'}
        </span>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{pkg.purpose || 'No purpose defined.'}</p>
        <div className="mt-3 text-sm flex justify-between items-center text-gray-600">
            <span className="font-medium">
                {pkg.projects?.length || 0} Project{pkg.projects?.length !== 1 ? 's' : ''}
            </span>
            {pkg.dueDate && <span className="text-xs">Due: {pkg.dueDate}</span>}
        </div>
    </div>
);

// --- NAVIGATION HEADER COMPONENT (with corrected /board link) ---
const NavigationHeader: React.FC<{ activePath: string }> = ({ activePath }) => {
    const navItemClass = "flex items-center px-4 py-2 rounded-lg transition-colors hover:bg-blue-50 text-gray-700 hover:text-blue-600";
    const activeItemClass = "bg-blue-100 text-blue-700 font-semibold shadow-inner";

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="text-2xl font-extrabold text-blue-600">Project Manager</div>
                <nav className="flex space-x-2">
                    {/* Link to the PackagePage (Root '/') */}
                    <Link 
                        to="/" 
                        className={`${navItemClass} ${activePath === '/' ? activeItemClass : ''}`}
                    >
                        <ListChecks className="w-5 h-5 mr-1" />
                        Packages
                    </Link>
                
                  
                    {/* Link to the DashboardPage - '/dashboard' */}
                    <Link 
                        to="/dashboard" 
                        className={`${navItemClass} ${activePath === '/dashboard' ? activeItemClass : ''}`}
                    >
                        <LayoutDashboard className="w-5 h-5 mr-1" />
                        Dashboard
                    </Link>
                </nav>
            </div>
        </header>
    );
};


// --- MAIN PAGE COMPONENT ---
const PackagePage: React.FC = () => {
  const [packages, setPackages] = useState<ProjectPackage[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); 
  const location = useLocation(); // Use useLocation to get the current path
  
  // To highlight the active page in the header
  const activePath = location.pathname;

  // State for the new package creation
  const [newPackageData, setNewPackageData] = useState<ProjectPackage>({
    name: "",
    purpose: "",
    status: ALL_PACKAGE_STATUSES[0],
    priority: ALL_PRIORITIES[0],
    projects: [],
  });
  const [newProject, setNewProject] = useState<Project>({ name: "", type: "React" });

  // --- Data Fetching (omitted for brevity) ---
  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_BASE}/packages`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages.");
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);
    
  // --- Filtering Logic (omitted for brevity) ---
  const filteredPackages = useMemo(() => {
    if (!searchTerm) return packages;
    const lowerSearch = searchTerm.toLowerCase();
    return packages.filter(pkg => 
        pkg.name.toLowerCase().includes(lowerSearch) ||
        pkg.purpose?.toLowerCase().includes(lowerSearch) ||
        pkg.projects?.some(p => p.name.toLowerCase().includes(lowerSearch))
    );
  }, [packages, searchTerm]);

  // --- Handlers ---
  const addProjectToPackage = () => {
    if (!newProject.name) return toast.error("Project name cannot be empty.");
    
    setNewPackageData(prev => {
        const updatedProjects = [...(prev.projects || []), { ...newProject }];
        return { ...prev, projects: updatedProjects };
    });
    setNewProject({ name: "", type: "React" });
  };

  const resetNewPackageData = () => {
    setNewPackageData({ 
        name: "", 
        purpose: "", 
        status: ALL_PACKAGE_STATUSES[0], 
        priority: ALL_PRIORITIES[0], 
        projects: [] 
    });
    setNewProject({ name: "", type: "React" });
  }

  // Modified to include default projects and use reset function
  const createPackage = async () => {
    if (!newPackageData.name) return toast.error("Package name is required.");

    // --- 🎯 NEW LOGIC: Inject Default Projects ---
    const packageName = newPackageData.name;
    const defaultProjects: Project[] = [
        { name: `${packageName}-frontend`, type: 'React' },
        { name: `${packageName}-backend`, type: 'Spring' },
    ];
    
    // Combine existing user-added projects with defaults
    const finalProjects = [...defaultProjects, ...(newPackageData.projects || [])];
    const dataToSend = { ...newPackageData, projects: finalProjects };
    // --- 🎯 END NEW LOGIC ---

    try {
      const response = await fetch(`${API_BASE}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend), // Send combined data
      });

      if (response.ok) {
        const createdPackage = await response.json();
        setPackages(prev => [...prev, createdPackage]);
        resetNewPackageData(); // Reset state
        setIsCreateModalOpen(false);
        toast.success(`Package '${createdPackage.name}' created successfully (with defaults)!`);
      } else {
        const errorMsg = await response.text();
        toast.error("Error creating package: " + errorMsg);
      }
    } catch (error) {
      console.error("Error creating package:", error);
      toast.error("An unexpected error occurred during creation.");
    }
  };
    
  const handleOpenDetails = (pkg: ProjectPackage) => {
      if (pkg.projects && pkg.projects.length > 0) {
          navigate(`/package/${encodeURIComponent(pkg.name)}`);
      } else {
          toast.info(`No projects in ${pkg.name}. Opening package details...`);
      }
  }
  
  // Adjusted modal close handler
  const handleCloseModal = () => {
    resetNewPackageData();
    setIsCreateModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader activePath={activePath} />
      <Toaster position="top-right" richColors />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
    
      {/* --- Header/Toolbar Area --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Project Packages 📦</h1>
        <button 
          onClick={() => {
              resetNewPackageData();
              setIsCreateModalOpen(true);
            }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-1" />
          Create Package
        </button>
      </div>
        
      {/* --- Filter/Search Area (omitted for brevity) --- */}

      {/* --- List Packages (Grid View) (omitted for brevity) --- */}
      {/* ... (filteredPackages.map(PackageCard) here) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPackages.map((pkg) => (
          <PackageCard key={pkg.name} pkg={pkg} onOpen={() => handleOpenDetails(pkg)} />
        ))}
          {filteredPackages.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-10">
                  No packages found matching your search.
              </p>
          )}
      </div>

        
      {/* --- Create Package Modal --- */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4 border-b pb-2">Create New Package</h2>
                  
                  {/* Package Details */}
                  <div className="mb-4 space-y-3">
                      <input
                          type="text"
                          placeholder="Package Name"
                          value={newPackageData.name}
                          onChange={(e) => setNewPackageData({ ...newPackageData, name: e.target.value })}
                          className="w-full border border-gray-300 p-3 rounded-lg"
                      />
                      {/* ... (purpose, status, priority inputs) ... */}
                      <textarea
                          placeholder="Purpose/Description (Optional)"
                          value={newPackageData.purpose}
                          onChange={(e) => setNewPackageData({ ...newPackageData, purpose: e.target.value })}
                          className="w-full border border-gray-300 p-3 rounded-lg resize-none"
                          rows={3}
                      />
                      <div className="flex gap-4">
                          <select
                              value={newPackageData.status}
                              onChange={(e) => setNewPackageData({ ...newPackageData, status: e.target.value })}
                              className="border border-gray-300 p-3 rounded-lg flex-1"
                          >
                              {ALL_PACKAGE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <select
                              value={newPackageData.priority}
                              onChange={(e) => setNewPackageData({ ...newPackageData, priority: e.target.value })}
                              className="border border-gray-300 p-3 rounded-lg flex-1"
                          >
                              {ALL_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                      </div>
                  </div>

                  {/* Add Projects Section */}
                  <div className="border-t pt-4 mt-4">
                      <h3 className="text-lg font-semibold mb-3">Add Additional Projects (Defaults will be added automatically)</h3>
                      <div className="flex gap-2 mb-3">
                          {/* ... (new project inputs) ... */}
                          <input
                              type="text"
                              placeholder="Project Name"
                              value={newProject.name}
                              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                              className="border border-gray-300 p-2 rounded-lg flex-1"
                          />
                          <select
                              value={newProject.type}
                              onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                              className="border border-gray-300 p-2 rounded-lg"
                          >
                              <option value="React">React</option>
                              <option value="Spring">Spring</option>
                              <option value="Other">Other</option>
                          </select>
                          <button onClick={addProjectToPackage} className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition">
                              Add
                          </button>
                      </div>

                      <div className="max-h-24 overflow-y-auto border p-2 rounded-lg bg-gray-50">
                          <ul className="text-sm space-y-1">
                              {/* Displaying Projects to be included */}
                              {newPackageData.projects?.length === 0 ? (
                                  <li className="text-gray-500">No additional projects added.</li>
                              ) : (
                                  newPackageData.projects?.map((p, idx) => (
                                      <li key={idx} className="flex justify-between items-center bg-white p-1 rounded-md shadow-sm">
                                          <span>{p.name}</span>
                                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{p.type}</span>
                                      </li>
                                  ))
                              )}
                              <li className="text-gray-500 italic mt-2">
                                  Default projects ({newPackageData.name}-frontend and {newPackageData.name}-backend) will be added automatically on create.
                              </li>
                          </ul>
                      </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-6">
                      <button onClick={handleCloseModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition">
                          Cancel
                      </button>
                      <button onClick={createPackage} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition">
                          Create Package
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
    </div>
  );
};

export default PackagePage;