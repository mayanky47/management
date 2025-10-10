// src/components/StatusBadge.tsx
import type { ProjectStatus } from '../types/project';

interface Props {
  status?: ProjectStatus;
}

export default function StatusBadge({ status = 'active' }: Props) {
  const map: Record<ProjectStatus, string> = {
    'active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'on-hold': 'bg-amber-50 text-amber-700 border-amber-200',
    'completed': 'bg-blue-50 text-blue-700 border-blue-200',
    'archived': 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}
