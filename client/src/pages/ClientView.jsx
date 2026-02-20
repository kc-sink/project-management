import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';

function ProgressBar({ value }) {
  return (
    <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-1">
      <div className="bg-zinc-800 h-1.5 rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

function statusProgress(status) {
  return { not_started: 0, in_progress: 50, review: 80, completed: 100 }[status] ?? 0;
}

export default function ClientView() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/projects/${projectId}`)
      .then(({ data }) => setProject(data))
      .catch(() => setError('Project not found.'))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-400 text-sm">
      Loading...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500 text-sm">
      {error}
    </div>
  );

  const completedMilestones = project.milestones?.filter((m) => m.status === 'completed').length ?? 0;
  const totalMilestones = project.milestones?.length ?? 0;

  const totalTasks = project.work_streams?.flatMap((ws) => ws.tasks).length ?? 0;
  const completedTasks = project.work_streams?.flatMap((ws) => ws.tasks)
    .filter((t) => t.status === 'completed').length ?? 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header banner */}
      <div className="bg-zinc-900 text-white px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-zinc-400 text-sm mb-1 font-medium tracking-wide uppercase">
            Project Status Report
          </div>
          <h1 className="text-3xl font-semibold">{project.name}</h1>
          <div className="text-zinc-400 mt-1 text-base">
            {project.client_name}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <StatusBadge status={project.status} className="text-sm px-3 py-1" />
            <span className="text-zinc-400 text-sm">
              {format(new Date(project.start_date), 'MMMM d, yyyy')} – {format(new Date(project.end_date), 'MMMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10 space-y-10">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Milestones', value: `${completedMilestones} / ${totalMilestones}`, sub: 'completed' },
            { label: 'Tasks', value: `${completedTasks} / ${totalTasks}`, sub: 'completed' },
            { label: 'Work Streams', value: project.work_streams?.length ?? 0, sub: 'total' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="border border-zinc-100 rounded-xl px-5 py-5">
              <div className="text-2xl font-semibold text-zinc-900">{value}</div>
              <div className="text-sm text-zinc-500 mt-0.5">{label} <span className="text-zinc-400">{sub}</span></div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        {project.milestones?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Milestones</h2>
            <div className="border border-zinc-100 rounded-xl overflow-hidden divide-y divide-zinc-100">
              {project.milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      m.status === 'completed' ? 'bg-emerald-500' :
                      m.status === 'missed' ? 'bg-red-500' : 'bg-amber-400'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-zinc-900">{m.name}</div>
                      {m.notes && <div className="text-xs text-zinc-400 mt-0.5">{m.notes}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm text-zinc-400">{format(new Date(m.date), 'MMM d, yyyy')}</span>
                    <StatusBadge status={m.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work streams */}
        {project.work_streams?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Work Streams</h2>
            <div className="space-y-4">
              {project.work_streams.map((ws) => {
                const wsTasks = ws.tasks ?? [];
                const wsCompleted = wsTasks.filter((t) => t.status === 'completed').length;
                const wsProgress = wsTasks.length > 0 ? Math.round((wsCompleted / wsTasks.length) * 100) : statusProgress(ws.status);

                return (
                  <div key={ws.id} className="border border-zinc-100 rounded-xl overflow-hidden">
                    <div
                      className="px-6 py-4 flex items-center justify-between border-l-4"
                      style={{ borderColor: ws.color }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-zinc-900">{ws.name}</span>
                          <StatusBadge status={ws.status} />
                        </div>
                        <div className="text-sm text-zinc-400 mt-0.5">
                          {format(new Date(ws.start_date), 'MMM d')} – {format(new Date(ws.end_date), 'MMM d, yyyy')}
                        </div>
                        <div className="mt-2 max-w-xs">
                          <div className="flex justify-between text-xs text-zinc-400 mb-1">
                            <span>Progress</span>
                            <span>{wsProgress}%</span>
                          </div>
                          <ProgressBar value={wsProgress} />
                        </div>
                      </div>
                    </div>

                    {/* Tasks (simplified for client) */}
                    {wsTasks.length > 0 && (
                      <div className="divide-y divide-zinc-50">
                        {wsTasks.map((task) => (
                          <div key={task.id} className="px-6 py-3 flex items-center justify-between bg-zinc-50/50">
                            <div className="flex items-center gap-3">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                task.status === 'completed' ? 'bg-emerald-500' :
                                task.status === 'in_progress' ? 'bg-violet-500' :
                                task.status === 'review' ? 'bg-orange-400' : 'bg-zinc-300'
                              }`} />
                              <span className="text-sm text-zinc-700">{task.name}</span>
                              {task.assignee_name && (
                                <span className="text-xs text-zinc-400">— {task.assignee_name}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs text-zinc-400 whitespace-nowrap">
                                {format(new Date(task.end_date), 'MMM d')}
                              </span>
                              <StatusBadge status={task.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400">
          Generated by Studio PM &middot; {format(new Date(), 'MMMM d, yyyy')}
        </div>
      </div>
    </div>
  );
}
