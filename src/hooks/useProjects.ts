import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Project, ProjectFormData, ProjectStatus, ProjectType } from '../types/project';
// Import the new 'analyzeProject' service
import { getProjects, createProject, updateProject, deleteProject, openProject, analyzeProject } from '../services/projectService';

export type Filters = {
  q: string;
  type: ProjectType | 'All';
  status: ProjectStatus | 'All';
  tag: string | 'All';
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ q: '', type: 'All', status: 'All', tag: 'All' });

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getProjects();
      setProjects(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  // ... (filtered and allTags memos remain the same) ...
  const filtered = useMemo(() => {
    const q = filters.q.toLowerCase();
    return projects.filter(p => {
      const matchesQ = !q || [p.name, p.purpose, p.pastActivities, p.futurePlans, (p.tags || []).join(' ')].join(' ').toLowerCase().includes(q);
      const matchesType = filters.type === 'All' || p.type === filters.type;
      const matchesStatus = filters.status === 'All' || (p.status || 'active') === filters.status; // Default undefined status to 'active' for filtering
      const matchesTag = filters.tag === 'All' || (p.tags || []).includes(filters.tag);
      return matchesQ && matchesType && matchesStatus && matchesTag;
    });
  }, [projects, filters]);

  const allTags = useMemo(() => Array.from(new Set(projects.flatMap(p => p.tags || []))), [projects]);


  const setSearch = (q: string) => setFilters(f => ({ ...f, q }));
  const setType = (type: Filters['type']) => setFilters(f => ({ ...f, type }));
  const setStatus = (status: Filters['status']) => setFilters(f => ({ ...f, status }));
  const setTag = (tag: Filters['tag']) => setFilters(f => ({ ...f, tag }));

  const create = async (data: ProjectFormData) => {
    const newProject = await createProject(data);
    await loadProjects(); // Refresh list
    return newProject;
  };

  // --- FIX: Changed 'id: number' to 'name: string' ---
  const doUpdate = async (project: Project) => {
    // The service now expects the name and the form data
    const updated = await updateProject(project.name, project);
    await loadProjects(); // Refresh list
    return updated;
  };

  // --- FIX: Changed 'id: number' to 'name: string' ---
  const doDelete = async (name: string) => {
    await deleteProject(name);
    await loadProjects(); // Refresh list
  };

  const doOpen = async (project: Project) => await openProject(project);

  // --- NEW: Function to trigger analysis ---
  const doAnalyze = async (name: string) => {
    try {
      // Call the service, which returns the updated project
      const updatedProject = await analyzeProject(name);
      // Manually update the project in the local state for immediate UI feedback
      setProjects(prevProjects => 
        prevProjects.map(p => p.name === name ? updatedProject : p)
      );
      return updatedProject;
    } catch (error) {
      console.error("Analysis failed:", error);
      throw error; // Re-throw to be caught by the UI component
    }
  };

  return {
    projects,
    filtered,
    allTags,
    loading,
    error,
    filters,
    setSearch,
    setType,
    setStatus,
    setTag,
    loadProjects,
    create,
    doUpdate, // Renamed from 'update'
    doDelete, // Renamed from 'remove'
    doOpen,
    doAnalyze, // <-- Export new function
  };
}
