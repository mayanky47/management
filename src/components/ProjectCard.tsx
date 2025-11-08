import { Tag } from './Tag';
import { Edit, Play } from 'lucide-react';
import type { Project } from '../types/project';
import { useProjects } from '../hooks/useProjects';
import { toast } from 'sonner';

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete?: () => void;
  dragHandle?: boolean;
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const { doOpen } = useProjects();

  const handleOpenProject = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering parent onClick
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

  const handleEditProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Edit project "${project.name}" (feature coming soon)`);
  };

  return (
    <div
      className="group bg-white p-4 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between cursor-pointer"
      onClick={onOpen}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg truncate text-gray-800 group-hover:text-blue-600 transition">
          {project.name}
        </h3>
        <div className="flex gap-2">
          {/* Open */}
          <button
            onClick={handleOpenProject}
            className="p-1 rounded-full hover:bg-green-50 transition"
            title="Open Project"
          >
            <Play className="w-4 h-4 text-green-600" />
          </button>

          {/* Edit */}
          <button
            onClick={handleEditProject}
            className="p-1 rounded-full hover:bg-blue-50 transition"
            title="Edit Project"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {project.status && (
          <Tag label={project.status} type="status" status={project.status} />
        )}
        <Tag label={project.type} type="type" />
        {project.tags?.map((tag) => <Tag key={tag} label={tag} />)}
      </div>

      {/* Progress */}
      {typeof project.progress === 'number' && (
        <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
          <div
            className="h-2 bg-blue-500 transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      )}

      {/* Purpose */}
      <p className="text-sm text-gray-600 mt-3 line-clamp-3">
        {project.purpose || 'No purpose set'}
      </p>
    </div>
  );
}
