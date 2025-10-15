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
// ⚠️ Updated Modal Component
import CreateProjectModal from '../components/CreateProjectModal'; 
import { useProjects } from '../hooks/useProjects';
import { createProject } from '../services/projectService';
import type { Project, ProjectType } from '../types/project';

// --- CONSTANTS ---
// Includes 'portfolio' as a type, though filtering logic might need adjustment in useProjects
const ALL_PROJECT_TYPES: ProjectType[] = ['react', 'spring', 'portfolio'];
const STATUSES = ['active', 'on-hold', 'completed', 'archived'] as const;

export default function DashboardPage() {
  // Assuming useProjects is updated to handle 'portfolio' type if needed
  const { filtered, filters, setSearch, setType, setStatus, setTag, doUpdate, doDelete } = useProjects();
  const navigate = useNavigate();
  // allTags now includes tags from subProjects if applicable
  const allTags = useMemo(() => Array.from(new Set(filtered.flatMap(p => [...(p.tags || []), ...(p.subProjects?.flatMap(sp => sp.tags || []) || [])]))), [filtered]);

  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');
  // columns state now stores project names (which are unique IDs)
  const [columns, setColumns] = useState<Record<string, string[]>>({});
  
  // State for the creation modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // Type of project to be created (optional: could be passed to modal)
  const [createType, setCreateType] = useState<ProjectType | null>(null);

  // Sync columns whenever filtered projects change (only uses top-level projects)
  useEffect(() => {
    const newCols: Record<string, string[]> = {};
    STATUSES.forEach(status => {
      newCols[status] = filtered
        .filter(p => p.status === status || (status === 'active' && !p.status))
        .map(p => p.name);
    });
    setColumns(newCols);
  }, [filtered]);

  // Find the project object by its name (ID)
  const getProjectByName = (name: string): Project | undefined => filtered.find(p => p.name === name);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Determine the column (status) for the active and over item
    const activeStatus = Object.keys(columns).find(col => columns[col].includes(activeId));
    const overStatus = Object.keys(columns).find(col => columns[col].includes(overId));
    if (!activeStatus || !overStatus) return;

    // 1. Reordering within the same column
    if (activeStatus === overStatus) {
      const newCol = [...columns[activeStatus]];
      const oldIndex = newCol.indexOf(activeId);
      const newIndex = newCol.indexOf(overId);
      
      // Perform simple reorder (splices)
      if (oldIndex !== -1 && newIndex !== -1) {
        newCol.splice(oldIndex, 1);
        newCol.splice(newIndex, 0, activeId);
        setColumns({ ...columns, [activeStatus]: newCol });
      }
    } 
    // 2. Moving to a different column (Status change)
    else {
      const newFrom = columns[activeStatus].filter(id => id !== activeId);
      // Find the index of the 'over' item in the 'to' column
      const overIndex = columns[overStatus].indexOf(overId);
      const newTo = [...columns[overStatus]];
      
      // Insert the active item at the position of the over item
      newTo.splice(overIndex !== -1 ? overIndex : newTo.length, 0, activeId);

      setColumns({ ...columns, [activeStatus]: newFrom, [overStatus]: newTo });

      // **Update the project's status in the backend/store**
      const project = getProjectByName(activeId);
      if (project) {
        // We only update the status if it's actually changing
        if (project.status !== overStatus) {
          // Casting is safe here as statuses comes from a defined array
          doUpdate({ ...project, status: overStatus as Project['status'] });
        }
      }
    }
  };

  const handleOpen = (project: Project) => {
    navigate(`/project/${encodeURIComponent(project.name)}`);
  };

  /**
   * Handles project creation, now including dependencies and potentially sub-projects
   * @param data The new project data from the modal, e.g., { name: '...', type: 'react', dependencies: ['...'], subProjects: [...] }
   */
  const handleCreate = async (data: any) => {
    try {
      // The modal should ensure data has the new fields like `dependencies` and `subProjects` (if type is 'portfolio')
      const project = await createProject(data); // API call: sends data including dependencies/sub-projects
      toast.success(`Created project "${project.name}"`);

      // Add to Active column, assuming new projects default to 'active' status
      setColumns(prev => ({
        ...prev,
        active: [project.name, ...(prev.active || [])],
      }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    }
    setIsCreateModalOpen(false); // Close modal on success/error
  };

  const handleDelete = async (project: Project) => {
    try {
      await doDelete(project.name);
      toast.success(`Deleted "${project.name}"`);

      // Also update the columns state
      setColumns(prev => {
        const newCols = { ...prev };
        STATUSES.forEach(status => {
          newCols[status] = (newCols[status] || []).filter(name => name !== project.name);
        });
        return newCols;
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  // --- RENDERING ---

  // Function to render either a ProjectCard in Grid mode or a SortableItem in Board mode
  const renderProject = (project: Project) => (
    <ProjectCard
      key={project.name}
      project={project}
      onOpen={() => handleOpen(project)}
      onDelete={() => handleDelete(project)}
      // Optional: Pass sub-projects/dependencies count to card for display
      // subProjectCount={project.subProjects?.length}
      // dependencyCount={project.dependencies?.length}
    />
  );


  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <Toaster position="top-right" richColors />

      {/* ⚠️ Update Header: onCreate should probably open the modal without a specific type */}
      <Header onSearch={setSearch} onCreate={() => { 
        setCreateType(null); // No pre-selected type
        setIsCreateModalOpen(true); 
      }} />
      <ProjectFilters 
        filters={filters} 
        setType={setType} 
        setStatus={setStatus} 
        setTag={setTag} 
        allTags={allTags} 
        // ⚠️ Pass all types to filters if it supports a dropdown
        allTypes={ALL_PROJECT_TYPES}
      />

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
          {/* Note: In Grid mode, filters already apply to 'filtered' */}
          {filtered.map(renderProject)}
          
          {/* Add a generic "Create Project" button in Grid mode */}
          <div 
            className="cursor-pointer border-2 border-dashed border-gray-400 rounded-xl p-4 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition min-h-[150px]"
            onClick={() => {
              setCreateType(null); // No pre-selected type
              setIsCreateModalOpen(true);
            }}
          >
            + Create New Project
          </div>
        </div>
      )}

      {/* Board Mode */}
      {viewMode === 'board' && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {/* The grid-cols should match the number of statuses (4) */}
          <div className="grid grid-cols-4 gap-4 w-full"> 
            {STATUSES.map(status => (
              <div key={status} className="bg-gray-100 p-2 rounded-lg min-h-[600px] flex flex-col">
                <h2 className="font-semibold mb-2 text-gray-700">{status.toUpperCase()}</h2>
                {/* Droppable context for the column */}
                <SortableContext items={columns[status] || []} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-4">
                    {(columns[status] || []).map(name => {
                      // Find the actual project object from the filtered list
                      const project = getProjectByName(name);
                      if (!project) return null; // Should not happen if `useEffect` is correct

                      return (
                        <SortableItem
                          key={project.name}
                          id={project.name} // The project name is the DND ID
                          onDoubleClick={() => handleOpen(project)}
                        >
                          {/* Use the common render function */}
                          {renderProject(project)} 
                        </SortableItem>
                      );
                    })}

                    {/* Add Project card in Active column */}
                    {status === 'active' && (
                      <div
                        className="cursor-pointer border-2 border-dashed border-gray-400 rounded-xl p-4 text-center text-gray-500 hover:bg-gray-200 transition"
                        onClick={() => {
                          // Allow user to pick type in modal, no pre-selection needed here
                          setCreateType(null); 
                          setIsCreateModalOpen(true);
                        }}
                      >
                        + Add New Project / Portfolio
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      )}

      {/* Create Project Modal (only open when requested) */}
      {isCreateModalOpen && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          // The creation is now managed within the modal on submit
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate} // The main creation handler
          // Optional: Pass the list of all project names to select as dependencies
          allProjectNames={filtered.map(p => p.name)}
        />
      )}
    </div>
  );
}