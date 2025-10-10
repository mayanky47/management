// src/components/ProjectFilters.tsx
import type { Filters } from '../hooks/useProjects';
import type { ProjectStatus, ProjectType } from '../types/project';

interface Props {
  filters: Filters;
  setType: (t: Filters['type']) => void;
  setStatus: (s: Filters['status']) => void;
  setTag: (tag: Filters['tag']) => void;
  allTags: string[];
}

const types: (ProjectType | 'All')[] = ['All', 'React', 'Spring', 'HTML/CSS/JS', 'Python', 'Java', 'Other'];
const statuses: (ProjectStatus | 'All')[] = ['All', 'active', 'on-hold', 'completed', 'archived'];

export default function ProjectFilters({ filters, setType, setStatus, setTag, allTags }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-3 mb-6">
      <select
        value={filters.type}
        onChange={(e) => setType(e.target.value as any)}
        className="p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {types.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => setStatus(e.target.value as any)}
        className="p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.tag}
        onChange={(e) => setTag(e.target.value as any)}
        className="p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="All">All tags</option>
        {allTags.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
}
