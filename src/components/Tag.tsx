interface TagProps {
  label: string;
  type?: 'status' | 'type' | 'custom';
  status?: 'active' | 'on-hold' | 'completed' | 'archived';
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  'on-hold': 'bg-amber-100 text-amber-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-slate-100 text-slate-600',
};

const TYPE_COLORS: Record<string, string> = {
  React: 'bg-blue-200 text-blue-900',
  Spring: 'bg-emerald-200 text-emerald-900',
  'HTML/CSS/JS': 'bg-orange-200 text-orange-900',
  Python: 'bg-yellow-200 text-yellow-900',
  Java: 'bg-red-200 text-red-900',
  Other: 'bg-gray-200 text-gray-800',
};

export function Tag({ label, type = 'custom', status }: TagProps) {
  let colorClass = 'bg-gray-200 text-gray-700';

  if (type === 'status' && status) {
    colorClass = STATUS_COLORS[status] || colorClass;
  } else if (type === 'type') {
    colorClass = TYPE_COLORS[label] || colorClass;
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}
