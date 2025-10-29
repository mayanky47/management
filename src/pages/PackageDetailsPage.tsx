// src/pages/PackageDetailsPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { ArrowLeft, GitBranch, Clock } from 'lucide-react';

// NOTE: You would import the actual ProjectCard component here.
// Since it's not provided, we use a simple placeholder.
const ProjectCardPlaceholder: React.FC<{ project: any; onOpen: () => void }> = ({ project, onOpen }) => (
    <div 
        className="bg-white p-4 rounded-xl shadow border border-gray-100 hover:shadow-lg transition cursor-pointer"
        onClick={onOpen}
    >
        <h4 className="text-lg font-semibold text-gray-800">{project.name}</h4>
        <p className="text-sm text-blue-600 font-medium mt-1">{project.type}</p>
        <div className="flex items-center text-gray-500 text-xs mt-2">
            <GitBranch className="w-4 h-4 mr-1" />
            <span>Project Path: {project.path || '/src'}</span>
        </div>
    </div>
);


// Reusing the interfaces for consistency
interface Project {
  name: string;
  type: string;
  path?: string;
}

interface ProjectPackage {
  name: string;
  purpose?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projects?: Project[];
}

const API_BASE = "http://localhost:8080/api";

export default function PackageDetailsPage() {
    // Get the package name from the URL parameter
    const { name: packageName } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState<ProjectPackage | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Data Fetching ---
    useEffect(() => {
        if (!packageName) {
            setLoading(false);
            return;
        }

        const fetchPackageDetails = async () => {
            try {
                // In a real application, you'd fetch the specific package by name.
                // For this example, we'll simulate finding it from an assumed general list fetch.
                // Replace with a dedicated endpoint: ${API_BASE}/packages/${encodeURIComponent(packageName)}
                
                // SIMULATED FETCH: Assuming API has a way to get a single package or all.
                const response = await fetch(`${API_BASE}/packages`); 
                const data: ProjectPackage[] = await response.json();

                const foundPackage = data.find(p => p.name === packageName);
                
                if (foundPackage) {
                    setPkg(foundPackage);
                } else {
                    toast.error(`Package "${packageName}" not found.`);
                    setPkg(null);
                }
            } catch (error) {
                console.error("Error fetching package details:", error);
                toast.error("Failed to load package details.");
            } finally {
                setLoading(false);
            }
        };

        fetchPackageDetails();
    }, [packageName]);


    const handleProjectClick = (projectName: string) => {
        navigate(`/project/${encodeURIComponent(projectName)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8 bg-gray-50 flex justify-center items-center">
                <p className="text-lg text-gray-600">Loading package details...</p>
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="min-h-screen p-8 bg-gray-50">
                <p className="text-lg text-red-500">Error: Package not found or data is missing.</p>
                <Link to="/" className="text-blue-600 hover:underline flex items-center mt-4">
                    <ArrowLeft className="w-5 h-5 mr-1" /> Back to Packages
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" richColors />

            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {/* --- Header/Navigation --- */}
                <Link to="/" className="text-blue-600 hover:underline flex items-center mb-6 font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Packages
                </Link>

                {/* --- Package Summary --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-blue-600">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{pkg.name}</h1>
                    <p className="text-gray-600 mb-4">{pkg.purpose || "No description provided."}</p>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                        <span className={`px-3 py-1 rounded-full text-white ${
                            pkg.status === 'Completed' ? 'bg-green-600' :
                            pkg.status === 'InProgress' ? 'bg-blue-600' :
                            'bg-gray-500'
                        }`}>
                            Status: {pkg.status || 'Draft'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-gray-800 ${
                            pkg.priority === 'High' ? 'bg-red-200' :
                            pkg.priority === 'Medium' ? 'bg-yellow-200' :
                            'bg-gray-200'
                        }`}>
                            Priority: {pkg.priority || 'N/A'}
                        </span>
                        {pkg.dueDate && (
                            <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                <Clock className="w-4 h-4 mr-1" />
                                Due: {pkg.dueDate}
                            </span>
                        )}
                    </div>
                </div>

                {/* --- Projects Section --- */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Projects in this Package ({pkg.projects?.length || 0})</h2>
                
                {pkg.projects && pkg.projects.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pkg.projects.map(project => (
                            <ProjectCardPlaceholder
                                key={project.name}
                                project={project}
                                onOpen={() => handleProjectClick(project.name)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl text-center text-gray-500 shadow">
                        No projects are currently associated with this package.
                    </div>
                )}
            </div>
        </div>
    );
}