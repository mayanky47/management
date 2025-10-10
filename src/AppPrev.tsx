import React, { useState, useEffect, type JSX } from 'react';

// Define interfaces for your data structures and component props
interface Project {
  name: string;
  type: string;
  path: string;
  purpose: string;
  pastActivities: string;
  futurePlans: string;
}

interface ProjectListProps {
  title: string;
  projects: Project[];
  icon: JSX.Element; // React element for the icon
  onCreateProject?: () => void; // Optional function for creating a new project
}

interface ShowProjectMessage {
  visible: boolean;
  message: string;
}

// Base URL for your Spring Boot API
const API_BASE_URL = 'http://localhost:8080/api/projects';
// Base URL for the Open Project API
const OPEN_API_BASE_URL = 'http://localhost:8080/api/open/projects';
// Base URL for the Create Project API
const CREATE_API_BASE_URL = 'http://localhost:8080/api/create/projects';


// Main App component
const App: React.FC = () => {
  // --- State for Project Management ---
  // selectedDirectory is now just a display of the backend's base path for new projects
  const [selectedDirectory, setSelectedDirectory] = useState<string>('D:\\project\\projects'); // Defaulted to the backend's base
  const [reactProjects, setReactProjects] = useState<Project[]>([]);
  const [springProjects, setSpringProjects] = useState<Project[]>([]);
  const [otherProjects, setOtherProjects] = useState<Project[]>([]);
  const [showProjectMessage, setShowProjectMessage] = useState<ShowProjectMessage>({ visible: false, message: '' });

  // --- State for Project Info/Edit Modal ---
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null); // The project being viewed/edited
  const [editedProjectDetails, setEditedProjectDetails] = useState<Project | null>(null); // Temporary state for form inputs
  const [modalError, setModalError] = useState<string | null>(null);

  // --- State for Create Project Modal ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newProjectDetails, setNewProjectDetails] = useState<Project | null>(null);
  const [createModalError, setCreateModalError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false); // Loading state for create operation
  const [isUpdating, setIsUpdating] = useState<boolean>(false); // Loading state for update operation


  /**
   * Fetches all projects from the Spring Boot API.
   * Categorizes them into React, Spring, and Other projects.
   */
  const handleLoadProjects = async (): Promise<void> => {
    setModalError(null);
    setCreateModalError(null);
    setShowProjectMessage({ visible: false, message: '' });
    setReactProjects([]);
    setSpringProjects([]);
    setOtherProjects([]);

    try {
      // Fetch all projects without a directory filter, backend handles discovery
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allProjects: Project[] = await response.json();

      setReactProjects(allProjects.filter(p => p.type === 'React'));
      setSpringProjects(allProjects.filter(p => p.type === 'Spring'));
      setOtherProjects(allProjects.filter(p => p.type !== 'React' && p.type !== 'Spring'));

    } catch (err: any) { // Use 'any' for error type if you don't have a specific error interface
      setModalError(`Failed to load projects: ${err.message}. Ensure Spring Boot backend is running and base directories exist.`);
      console.error("Error loading projects:", err);
    }
  };

  // Effect to load projects automatically on initial mount
  useEffect(() => {
    handleLoadProjects(); // Load all projects directly from backend on startup
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Calls the backend API to open a project.
   * The backend will then execute a local script to launch the IDE.
   * @param {Project} project The project object to open.
   */
  const handleOpenProject = async (project: Project): Promise<void> => {
    setShowProjectMessage({ visible: true, message: `Attempting to open "${project.name}"...` });
    setModalError(null); // Clear any previous errors

    try {
      // Send the entire project object in the request body
      const response = await fetch(OPEN_API_BASE_URL, { // No {name} in path
        method: 'POST', // Use POST for actions
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project), // Send the project object
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const successMessage: string = await response.text(); // Backend returns a string message
      setShowProjectMessage({ visible: true, message: successMessage });

    } catch (err: any) {
      setShowProjectMessage({ visible: true, message: `Failed to open project: ${err.message}` });
      setModalError(`Failed to open project: ${err.message}`);
      console.error("Error opening project:", err);
    } finally {
      setTimeout(() => {
        setShowProjectMessage({ visible: false, message: '' });
        setModalError(null); // Clear error message after a delay too
      }, 5000);
    }
  };

  /**
   * Opens the project info modal and sets the project to be edited.
   * @param {Project} project The project to view/edit.
   */
  const handleViewProjectInfo = (project: Project): void => {
    setEditingProject(project);
    setEditedProjectDetails({ ...project });
    setIsModalOpen(true);
    setModalError(null);
  };

  /**
   * Closes the project info modal.
   */
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingProject(null);
    setEditedProjectDetails(null);
    setModalError(null);
  };

  /**
   * Handles changes in the input fields within the project info modal.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e The change event from the input.
   */
  const handleChangeEditedProjectDetails = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setEditedProjectDetails(prevDetails => ({
      ...(prevDetails as Project), // Assert as Project to ensure properties exist
      [name]: value
    }));
  };

  /**
   * Updates an existing project via the Spring Boot API.
   */
  const handleUpdateProject = async (): Promise<void> => {
    if (!editedProjectDetails?.name.trim() || !editedProjectDetails?.type.trim()) {
      setModalError("Project name and type cannot be empty!");
      return;
    }
    setIsUpdating(true);
    setModalError(null);

    try {
      // Use project name in the URL for PUT request
      const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(editedProjectDetails.name)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProjectDetails),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const updatedProject: Project = await response.json();

      // Re-load all projects to ensure consistent state after update
      handleLoadProjects();

      setShowProjectMessage({ visible: true, message: `Project "${updatedProject.name}" updated successfully!` });
      handleCloseModal();
    } catch (err: any) {
      setModalError(`Failed to update project: ${err.message}`);
      console.error("Error updating project:", err);
    } finally {
      setIsUpdating(false);
      setTimeout(() => {
        setShowProjectMessage({ visible: false, message: '' });
      }, 5000);
    }
  };

  // --- Create Project Functions ---

  /**
   * Opens the create project modal with pre-filled type.
   * @param {string} type The type of project to create (e.g., 'React', 'Spring').
   */
  const handleOpenCreateProjectModal = (type: string): void => {
    setNewProjectDetails({
      name: '', // Name will be provided by user and used as ID
      type: type,
      path: '', // Path will be generated by backend
      purpose: '',
      pastActivities: '',
      futurePlans: ''
    });
    setIsCreateModalOpen(true);
    setCreateModalError(null);
  };

  /**
   * Closes the create project modal.
   */
  const handleCloseCreateModal = (): void => {
    setIsCreateModalOpen(false);
    setNewProjectDetails(null);
    setCreateModalError(null);
  };

  /**
   * Handles changes in the input fields within the create project modal.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e The change event from the input.
   */
  const handleChangeNewProjectDetails = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setNewProjectDetails(prevDetails => ({
      ...(prevDetails as Project), // Assert as Project
      [name]: value
    }));
  };

  /**
   * Handles the submission of the new project form to the Spring Boot API.
   */
  const handleCreateProjectSubmit = async (): Promise<void> => {
    if (!newProjectDetails?.name.trim() || !newProjectDetails?.type.trim()) {
      setCreateModalError("Project name and type cannot be empty!");
      return;
    }
    setIsCreating(true);
    setCreateModalError(null);

    try {
      // Changed API_BASE_URL to CREATE_API_BASE_URL
      const response = await fetch(CREATE_API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send only the necessary fields; backend will use name as ID and generate path
        body: JSON.stringify({
          name: newProjectDetails.name,
          type: newProjectDetails.type,
          purpose: newProjectDetails.purpose,
          pastActivities: newProjectDetails.pastActivities,
          futurePlans: newProjectDetails.futurePlans,
        }),
      });

      if (response.status === 409) { // Check for Conflict status
        throw new Error(`Project with name "${newProjectDetails.name}" already exists.`);
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const createdProject: Project = await response.json();

      // Re-load all projects to ensure consistent state after creation
      handleLoadProjects();

      setShowProjectMessage({ visible: true, message: `Project "${createdProject.name}" created successfully!` });
      handleCloseCreateModal();
    } catch (err: any) {
      setCreateModalError(`Failed to create project: ${err.message}`);
      console.error("Error creating project:", err);
    } finally {
      setIsCreating(false);
      setTimeout(() => {
        setShowProjectMessage({ visible: false, message: '' });
      }, 5000);
    }
  };


  // Helper component to render a list of projects
  const ProjectList: React.FC<ProjectListProps> = ({ title, projects, icon, onCreateProject }) => (
    <div className="mt-4 p-4 bg-white rounded-md shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center justify-between">
        <span className="flex items-center">
          {icon}
          {title} ({projects.length})
        </span>
        {onCreateProject && (
          <button
            onClick={onCreateProject}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:from-purple-600 hover:to-pink-700 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
          >
            Create New {title.split(' ')[0]} Project
          </button>
        )}
      </h3>
      {projects.length > 0 ? (
        <ul className="space-y-2">
          {projects.map((project) => (
            // Use project.name as key since it's now the unique identifier
            <li key={project.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm border border-gray-100">
              <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-gray-800">{project.name}</p>
                <p className="text-sm text-gray-600">Type: {project.type}</p>
                <p className="text-xs text-gray-500 truncate w-48 sm:w-auto">Path: {project.path}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewProjectInfo(project)}
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:from-blue-500 hover:to-cyan-600 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                >
                  View Info
                </button>
                <button
                  onClick={() => handleOpenProject(project)}
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:from-green-600 hover:to-teal-700 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
                >
                  Open
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No {title.toLowerCase()} found in this directory.</p>
      )}
    </div>
  );


  // --- UI Layout ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 w-full max-w-full lg:max-w-6xl transform transition-all duration-300 hover:scale-[1.005] border border-blue-200">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Project Hub
            </span>
          </h1>
          <p className="text-lg text-gray-600">Manage your development projects</p>
        </header>

        {/* Project Management Section */}
        <section className="mb-8 p-6 bg-yellow-50 rounded-lg shadow-inner border border-yellow-100">
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm4 2a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm-1 5a1 1 0 011-1h8a1 1 0 110 2H7a1 1 0 01-1-1zm1-5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
            Project Management (Live API)
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
            {/* Display a fixed "base directory" as context for new projects */}
            <label htmlFor="selectedDirectoryDisplay" className="block text-sm font-medium text-gray-700">Base Project Directory:</label>
            <input
              type="text"
              id="selectedDirectoryDisplay"
              value={selectedDirectory} // This now reflects the backend's base path for new projects
              readOnly
              className="flex-grow p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-default focus:outline-none"
            />
            {/* Removed the "Change Directory" button and directory selection modal */}
          </div>

          {/* React Projects Section */}
          {(reactProjects.length > 0 || true) && ( // Always show section
            <ProjectList
              title="React Projects"
              projects={reactProjects}
              icon={<svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.395 2.545a.5.5 0 00-.792-.023l-3.5 3.5a.5.5 0 000 .707l3.5 3.5a.5.5 0 00.707 0l3.5-3.5a.5.5 0 000-.707l-3.5-3.5zM15 10a5 5 0 11-10 0 5 5 0 0110 0z" clipRule="evenodd"></path></svg>}
              onCreateProject={() => handleOpenCreateProjectModal('React')}
            />
          )}

          {/* Spring Projects Section */}
          {(springProjects.length > 0 || true) && ( // Always show section
            <ProjectList
              title="Spring Projects"
              projects={springProjects}
              icon={<svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-4a1 1 0 011 1v2a1 1 0 11-2 0V7a1 1 0 011-1zm0 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path></svg>}
              onCreateProject={() => handleOpenCreateProjectModal('Spring')}
            />
          )}

          {/* Other Projects Section */}
          {(otherProjects.length > 0 || true) && ( // Always show section
            <ProjectList
              title="Other Projects"
              projects={otherProjects}
              icon={<svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0118 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2h2v2H6V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6z" clipRule="evenodd"></path></svg>}
            />
          )}


          {showProjectMessage.visible && (
            <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-md border border-blue-200 shadow-sm">
              <p className="font-medium">Action Status:</p>
              <p className="break-words">{showProjectMessage.message}</p>
            </div>
          )}
        </section>

        {/* Error Display (general errors) */}
        {modalError && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200 shadow-md flex items-center">
            <svg className="w-6 h-6 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            <p className="font-medium">Error: <span className="font-normal">{modalError}</span></p>
          </div>
        )}

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Built with React and Tailwind CSS</p>
        </footer>
      </div>

      {/* Project Info Modal (Edit Existing) */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Edit Project Details
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">Project Name:</label>
                <input
                  type="text"
                  id="projectName"
                  name="name"
                  value={editedProjectDetails?.name || ''}
                  onChange={handleChangeEditedProjectDetails}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-gray-700"
                />
              </div>
              <div>
                <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">Project Type:</label>
                <select
                  id="projectType"
                  name="type"
                  value={editedProjectDetails?.type || ''}
                  onChange={handleChangeEditedProjectDetails}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-gray-700 bg-white"
                >
                  <option value="React">React</option>
                  <option value="Spring">Spring</option>
                  <option value="HTML/CSS/JS">HTML/CSS/JS</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="projectPath" className="block text-sm font-medium text-gray-700 mb-1">Project Path:</label>
                <input
                  type="text"
                  id="projectPath"
                  name="path"
                  value={editedProjectDetails?.path || ''}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* New Fields */}
              <div>
                <label htmlFor="projectPurpose" className="block text-sm font-medium text-gray-700 mb-1">What it is for (Purpose):</label>
                <textarea
                  id="projectPurpose"
                  name="purpose"
                  value={editedProjectDetails?.purpose || ''}
                  onChange={handleChangeEditedProjectDetails}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-gray-700 resize-y"
                  placeholder="e.g., Frontend for the main web application."
                ></textarea>
              </div>
              <div>
                <label htmlFor="projectPastActivities" className="block text-sm font-medium text-gray-700 mb-1">What has happened (Past Activities):</label>
                <textarea
                  id="projectPastActivities"
                  name="pastActivities"
                  value={editedProjectDetails?.pastActivities || ''}
                  onChange={handleChangeEditedProjectDetails}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-gray-700 resize-y"
                  placeholder="e.g., Initial setup, user authentication module, dashboard UI."
                ></textarea>
              </div>
              <div>
                <label htmlFor="projectFuturePlans" className="block text-sm font-medium text-gray-700 mb-1">What I'm planning to do (Future Plans):</label>
                <textarea
                  id="projectFuturePlans"
                  name="futurePlans"
                  value={editedProjectDetails?.futurePlans || ''}
                  onChange={handleChangeEditedProjectDetails}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-gray-700 resize-y"
                  placeholder="e.g., Integrate with real backend APIs, add data visualization components."
                ></textarea>
              </div>
            </div>

            {modalError && ( // Display error specific to modal
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md border border-red-200 text-sm">
                {modalError}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-gray-800 font-bold py-2 px-5 rounded-lg shadow-md hover:bg-gray-400 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-2 px-5 rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && newProjectDetails && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Create New {newProjectDetails.type} Project
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="newProjectName" className="block text-sm font-medium text-gray-700 mb-1">Project Name:</label>
                <input
                  type="text"
                  id="newProjectName"
                  name="name"
                  value={newProjectDetails?.name || ''}
                  onChange={handleChangeNewProjectDetails}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-gray-700"
                  placeholder="e.g., My New React App"
                />
              </div>
              <div>
                <label htmlFor="newProjectPurpose" className="block text-sm font-medium text-gray-700 mb-1">What it is for (Purpose):</label>
                <textarea
                  id="newProjectPurpose"
                  name="purpose"
                  value={newProjectDetails?.purpose || ''}
                  onChange={handleChangeNewProjectDetails}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-gray-700 resize-y"
                  placeholder="e.g., A new feature for the main application."
                ></textarea>
              </div>
              <div>
                <label htmlFor="newProjectPastActivities" className="block text-sm font-medium text-gray-700 mb-1">What has happened (Past Activities):</label>
                <textarea
                  id="newProjectPastActivities"
                  name="pastActivities"
                  value={newProjectDetails?.pastActivities || ''}
                  onChange={handleChangeNewProjectDetails}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-gray-700 resize-y"
                  placeholder="e.g., Initial commit, basic setup completed."
                ></textarea>
              </div>
              <div>
                <label htmlFor="newProjectFuturePlans" className="block text-sm font-medium text-gray-700 mb-1">What I'm planning to do (Future Plans):</label>
                <textarea
                  id="newProjectFuturePlans"
                  name="futurePlans"
                  value={newProjectDetails?.futurePlans || ''}
                  onChange={handleChangeNewProjectDetails}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-gray-700 resize-y"
                  placeholder="e.g., Implement core logic, integrate with other modules."
                ></textarea>
              </div>
              {/* Type is read-only for creation, derived from context */}
              <div>
                <label htmlFor="newProjectType" className="block text-sm font-medium text-gray-700 mb-1">Project Type:</label>
                <input
                  type="text"
                  id="newProjectType"
                  name="type"
                  value={newProjectDetails?.type || ''}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {createModalError && ( // Display error specific to create modal
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md border border-red-200 text-sm">
                {createModalError}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseCreateModal}
                className="bg-gray-300 text-gray-800 font-bold py-2 px-5 rounded-lg shadow-md hover:bg-gray-400 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProjectSubmit}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-2 px-5 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
