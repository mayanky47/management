import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Project, ProjectFormData, ProjectStatus, ProjectType } from '../types/project';
import { getProjects, createProject, updateProject, deleteProject, openProject } from '../services/projectService';

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

  const filtered = useMemo(() => {
    const q = filters.q.toLowerCase();
    return projects.filter(p => {
      const matchesQ = !q || [p.name, p.purpose, p.pastActivities, p.futurePlans, (p.tags || []).join(' ')].join(' ').toLowerCase().includes(q);
      const matchesType = filters.type === 'All' || p.type === filters.type;
      const matchesStatus = filters.status === 'All' || p.status === filters.status;
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
    await loadProjects();
    return newProject;
  };

  const update = async (id: number, data: ProjectFormData) => {
    const updated = await updateProject(id, data);
    await loadProjects();
    return updated;
  };

  const remove = async (id: number) => {
    await deleteProject(id);
    await loadProjects();
  };

  const doOpen = async (project: Project) => await openProject(project);

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
    update,
    remove,
    doOpen,
  };
}
