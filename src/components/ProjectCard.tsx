import { Tag } from './Tag';
import { Edit, Play } from 'lucide-react';
import type { Project } from '../types/project';
import { useProjects } from '../hooks/useProjects';
import { toast } from 'sonner';

interface Props {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
  dragHandle?: boolean; // optional: for future drag handle
}

export default function ProjectCard({ project, onOpen }: Props) {
    const {  doOpen } = useProjects();
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
    <div
      className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between cursor-pointer"
      onClick={onOpen} // click navigates to project
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{project.name}</h3>
        <div className="flex gap-2">
          {/* Open Project button */}
          <button onClick={handleOpen} className="p-1 rounded-full hover:bg-gray-100">
            <Play className="w-4 h-4 text-green-600" />
          </button>

          {/* Optional Edit button */}
          <button className="p-1 rounded-full hover:bg-gray-100">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {project.status && <Tag label={project.status} type="status" status={project.status} />}
        <Tag label={project.type} type="type" />
        {project.tags?.map(tag => (
          <Tag key={tag} label={tag} />
        ))}
      </div>

      {/* Progress bar */}
      {project.progress !== undefined && (
        <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      )}

      {/* Purpose / brief */}
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{project.purpose || 'No purpose set'}</p>
    </div>
  );
}
