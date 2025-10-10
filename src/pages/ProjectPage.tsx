// src/pages/ProjectPage.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { Tag } from '../components/Tag';
import { ArrowLeft, Trash2, Edit, FolderOpen } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function ProjectPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { filtered, doDelete, doOpen } = useProjects();

  const project = filtered.find(p => p.name === name);

  if (!project) return <p className="p-8 text-gray-600">Project not found.</p>;

  const handleDelete = async () => {
    try {
      await doDelete(project.name);
      toast.success(`Deleted "${project.name}"`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  const handleOpen = async () => {
    try {
      if (doOpen) {
        await doOpen(project);
        toast.success(`Project "${project.name}" opened successfully`);
      } else {
        toast.info(`Opening "${project.name}" (API not implemented)`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to open project');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleOpen}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition"
          >
            <FolderOpen className="w-4 h-4" />
            Open Project
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-2xl shadow p-6 md:p-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{project.name}</h1>

        {/* Status, Type, Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {project.status && <Tag label={project.status} type="status" status={project.status} />}
          <Tag label={project.type} type="type" />
          {project.tags?.map(tag => <Tag key={tag} label={tag} />)}
        </div>

        {/* Progress */}
        {project.progress !== undefined && (
          <div className="mt-4">
            <p className="text-gray-600 mb-1">Progress: {project.progress}%</p>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div
                className="h-3 bg-blue-500 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Details Sections */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Purpose</h2>
            <p className="text-gray-600">{project.purpose || 'No purpose provided.'}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Past Activities</h2>
            <p className="text-gray-600">{project.pastActivities || 'No past activities recorded.'}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Future Plans</h2>
            <p className="text-gray-600">{project.futurePlans || 'No future plans defined.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
