import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

interface Props {
  id: string;
  children: ReactNode;
  onDoubleClick?: () => void; // optional double-click handler
}

export default function SortableItem({ id, children, onDoubleClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={onDoubleClick} // handle double-click
    >
      {children}
    </div>
  );
}
