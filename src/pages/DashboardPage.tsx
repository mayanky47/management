// src/pages/DashboardPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import Header from '../components/Header';
import ProjectFilters from '../components/ProjectFilters';
import ProjectCard from '../components/ProjectCard';
import SortableItem from '../components/SortableItem';
import CreateProjectModal from '../components/CreateProjectModal';
import { useProjects } from '../hooks/useProjects';
import { createProject } from '../services/projectService';
import type { Project, ProjectType } from '../types/project';

export default function DashboardPage() {
  const { filtered, filters, setSearch, setType, setStatus, setTag, doUpdate, doDelete } = useProjects();
  const navigate = useNavigate();
  const allTags = useMemo(() => Array.from(new Set(filtered.flatMap(p => p.tags || []))), [filtered]);

  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');
  const statuses = ['active', 'on-hold', 'completed', 'archived'] as const;

  const [columns, setColumns] = useState<Record<string, string[]>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<ProjectType | null>(null);

  // Sync columns whenever filtered projects change
  useEffect(() => {
    const newCols: Record<string, string[]> = {};
    statuses.forEach(status => {
      newCols[status] = filtered
        .filter(p => p.status === status || (status === 'active' && !p.status))
        .map(p => p.name);
    });
    setColumns(newCols);
  }, [filtered]);

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
      if (project) doUpdate({ ...project, status: overStatus as any });
    }
  };

  const handleOpen = (project: Project) => {
    navigate(`/project/${encodeURIComponent(project.name)}`);
  };

  const handleCreate = async (data: any) => {
    try {
      const project = await createProject(data); // API call
      toast.success(`Created project "${project.name}"`);

      // Add to Active column
      setColumns(prev => ({
        ...prev,
        active: [project.name, ...(prev.active || [])],
      }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  const handleDelete = async (project: Project) => {
    try {
      await doDelete(project.name);
      toast.success(`Deleted "${project.name}"`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <Toaster position="top-right" richColors />

      <Header onSearch={setSearch} onCreate={() => {}} />
      <ProjectFilters filters={filters} setType={setType} setStatus={setStatus} setTag={setTag} allTags={allTags} />

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          className={`px-4 py-2 rounded-xl ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('grid')}
        >
          Grid
        </button>
        <button
          className={`px-4 py-2 rounded-xl ${viewMode === 'board' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('board')}
        >
          Board
        </button>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard
              key={project.name}
              project={project}
              onOpen={() => handleOpen(project)}
              onDelete={() => handleDelete(project)}
            />
          ))}
        </div>
      )}

      {/* Board Mode */}
      {viewMode === 'board' && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-4 gap-4 w-full">
            {statuses.map(status => (
              <div key={status} className="bg-gray-100 p-2 rounded-lg min-h-[600px] flex flex-col">
                <h2 className="font-semibold mb-2 text-gray-700">{status.toUpperCase()}</h2>
                <SortableContext items={columns[status] || []} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-4">
                    {(columns[status] || []).map(name => {
                      const project = filtered.find(p => p.name === name);
                      if (!project) return null;
                      return (
                        <SortableItem
                          key={project.name}
                          id={project.name}
                          onDoubleClick={() => handleOpen(project)}
                        >
                          <ProjectCard
                            project={project}
                            onOpen={() => handleOpen(project)}
                            onDelete={() => handleDelete(project)}
                          />
                        </SortableItem>
                      );
                    })}

                    {/* Add Project card only in Active & matching filter */}
                    {status === 'active' && filters.type && (
                      <div
                        className="cursor-pointer border-2 border-dashed border-gray-400 rounded-xl p-4 text-center text-gray-500 hover:bg-gray-200 transition"
                        onClick={() => {
                          setCreateType(filters.type as ProjectType);
                          setIsCreateModalOpen(true);
                        }}
                      >
                        + Add {filters.type} Project
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      )}

      {/* Create Project Modal */}
      {createType && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
