const STATUS_STYLES = {
  active:       'bg-emerald-50 text-emerald-700 border border-emerald-200',
  completed:    'bg-blue-50 text-blue-700 border border-blue-200',
  on_hold:      'bg-amber-50 text-amber-700 border border-amber-200',
  cancelled:    'bg-red-50 text-red-700 border border-red-200',
  not_started:  'bg-zinc-100 text-zinc-600 border border-zinc-200',
  in_progress:  'bg-violet-50 text-violet-700 border border-violet-200',
  review:       'bg-orange-50 text-orange-700 border border-orange-200',
  upcoming:     'bg-sky-50 text-sky-700 border border-sky-200',
  missed:       'bg-red-50 text-red-700 border border-red-200',
};

const STATUS_LABELS = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
  not_started: 'Not Started',
  in_progress: 'In Progress',
  review: 'In Review',
  upcoming: 'Upcoming',
  missed: 'Missed',
};

export default function StatusBadge({ status, className = '' }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] || 'bg-zinc-100 text-zinc-600'} ${className}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
