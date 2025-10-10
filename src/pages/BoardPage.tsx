// src/pages/BoardPage.tsx
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import SortableItem from '../components/SortableItem';

function SortableProject({ project, navigate }: { project: any; navigate: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: project.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 999 : 'auto',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="cursor-pointer hover:shadow-lg transition"
      onClick={() => navigate(`/project/${encodeURIComponent(project.name)}`)}
    >
      <ProjectCard project={project} onOpen={() => {}} onDelete={() => {}} />
    </motion.div>
  );
}

export default function BoardPage() {
  const { filtered, doUpdate } = useProjects();
  const navigate = useNavigate();

  const statuses = ['active', 'on-hold', 'completed', 'archived', 'backlog'] as const;

  const getColumns = useMemo(() => {
    return statuses.reduce<Record<string, string[]>>((acc, status) => {
      if (status === 'backlog') {
        acc[status] = filtered.filter(p => !p.status).map(p => p.name);
      } else {
        acc[status] = filtered.filter(p => p.status === status).map(p => p.name);
      }
      return acc;
    }, {});
  }, [filtered]);

  const [columns, setColumns] = useState(getColumns);

  useEffect(() => {
    setColumns(getColumns);
  }, [getColumns]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeStatus = Object.keys(columns).find(col => columns[col].includes(active.id));
    const overStatus = Object.keys(columns).find(col => columns[col].includes(over.id));
    if (!activeStatus || !overStatus) return;

    if (activeStatus === overStatus) {
      const newCol = [...columns[activeStatus]];
      const oldIndex = newCol.indexOf(active.id);
      const newIndex = newCol.indexOf(over.id);
      newCol.splice(oldIndex, 1);
      newCol.splice(newIndex, 0, active.id);
      setColumns({ ...columns, [activeStatus]: newCol });
    } else {
      const newFrom = columns[activeStatus].filter(id => id !== active.id);
      const newTo = [...columns[overStatus], active.id];
      setColumns({ ...columns, [activeStatus]: newFrom, [overStatus]: newTo });

      const project = filtered.find(p => p.name === active.id);
      if (project) doUpdate({ ...project, status: overStatus === 'backlog' ? undefined : overStatus });
    }
  };

  const columnColors: Record<string, string> = {
    active: 'bg-blue-100',
    'on-hold': 'bg-yellow-100',
    completed: 'bg-green-100',
    archived: 'bg-gray-200',
    backlog: 'bg-purple-100',
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
 <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <div className="w-full overflow-x-auto">
    <div className="flex gap-4 min-w-full">
      {statuses.map(status => (
        <div
          key={status}
          className="bg-gray-100 rounded-xl min-w-[300px] flex-shrink-0 flex flex-col p-3"
        >
          <h2 className="font-bold mb-2 text-gray-700">{status.toUpperCase()}</h2>
          <SortableContext items={columns[status] || []} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {(columns[status] || []).map(name => {
                const project = filtered.find(p => p.name === name);
                if (!project) return null;
                return (
                  <SortableItem key={project.name} id={project.name}>
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        navigate(`/project/${encodeURIComponent(project.name)}`)
                      }
                    >
                      <ProjectCard project={project} onOpen={() => {}} onDelete={() => {}} />
                    </div>
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </div>
      ))}
    </div>
  </div>
</DndContext>

    </div>
  );
}
