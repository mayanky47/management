import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProjectCard from './ProjectCard';
import type { Project } from '../types/project';

interface Props {
  id: string;
  project: Project;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
}

export default function SortableProjectCard({ id, project, index, onOpen, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProjectCard project={project} onOpen={onOpen} onDelete={onDelete} />
    </div>
  );
}
