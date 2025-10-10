// src/components/BoardSection.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Project, ProjectType } from '../types/project';
import ProjectCard from './ProjectCard';
import { toast } from 'sonner';

interface BoardSectionProps {
  projects: Project[];
  onUpdate: (project: Project) => void;
  onCreate: (type: ProjectType) => void;
}

const statuses = ['active', 'on-hold', 'completed', 'archived'] as const;

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function BoardSection({ projects, onUpdate, onCreate }: BoardSectionProps) {
  const navigate = useNavigate();
  const [columns, setColumns] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const cols: Record<string, string[]> = {};
    statuses.forEach(status => {
      cols[status] = projects
        .filter(p => p.status === status || (!p.status && status === 'active'))
        .map(p => p.name);
    });
    setColumns(cols);
  }, [projects]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeStatus = Object.keys(columns).find(col => columns[col].includes(active.id));
    const overStatus = Object.keys(columns).find(col => columns[col].includes(over.id));
    if (!activeStatus || !overStatus) return;

    const newFrom = columns[activeStatus].filter(id => id !== active.id);
    const newTo = [...columns[overStatus]];
    const overIndex = newTo.indexOf(over.id);
    if (overIndex >= 0) newTo.splice(overIndex, 0, active.id);
    else newTo.push(active.id);

    setColumns({ ...columns, [activeStatus]: newFrom, [overStatus]: newTo });

    if (activeStatus !== overStatus) {
      const project = projects.find(p => p.name === active.id);
      if (project) onUpdate({ ...project, status: overStatus as any });
    }
  };

  return (
    <section className="w-full p-4 bg-gray-50">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 w-full">
          {statuses.map(status => (
            <div
              key={status}
              className="bg-gray-100 rounded-xl flex-1 flex flex-col p-4 shadow-inner max-h-[85vh]"
            >
              <h2 className="font-bold mb-4 text-gray-700 text-center border-b pb-2">{status.toUpperCase()}</h2>
              <SortableContext items={columns[status] || []} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                  {(columns[status] || []).map(name => {
                    const project = projects.find(p => p.name === name);
                    if (!project) return null;
                    return (
                      <SortableItem key={project.name} id={project.name}>
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/project/${encodeURIComponent(project.name)}`)}
                        >
                          <ProjectCard project={project} onOpen={() => {}} onDelete={() => {}} />
                        </div>
                      </SortableItem>
                    );
                  })}

                  {status === 'active' && (
                    <div
                      className="cursor-pointer border-2 border-dashed border-gray-400 rounded-xl p-4 text-center text-gray-500 hover:bg-gray-200 transition"
                      onClick={() => {
                        onCreate('Other');
                        toast.success('New project added');
                      }}
                    >
                      + Add Project
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </section>
  );
}
