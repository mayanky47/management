import ProjectCard from './ProjectCard';
import type { Project } from '../types/project';

interface ProjectListProps {
  projects: Project[];
  onOpen: (p: Project) => void;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}

export default function ProjectList({ projects, onOpen, onEdit, onDelete }: ProjectListProps) {
  if (projects.length === 0) {
    return <p className="text-gray-500 text-center mt-12">No projects found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(p => (
        <ProjectCard key={p.name} project={p} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
