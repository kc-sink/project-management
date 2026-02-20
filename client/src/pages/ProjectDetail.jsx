import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useProject, useTeam, api } from '../hooks/useApi';
import StatusBadge from '../components/StatusBadge';
import GanttView from '../components/GanttView';
import Modal from '../components/Modal';

const STREAM_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6'];
const WS_STATUSES = ['not_started','in_progress','review','completed'];
const TASK_STATUSES = ['not_started','in_progress','review','completed'];

// ---- Work Stream Form ----
function WorkStreamForm({ projectId, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name: '', description: '', start_date: '', end_date: '',
    status: 'not_started', color: STREAM_COLORS[0],
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(form);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Name</label>
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Brand Discovery" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Start</label>
          <input className="input" type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} required />
        </div>
        <div>
          <label className="label">End</label>
          <input className="input" type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {WS_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {STREAM_COLORS.map((c) => (
              <button type="button" key={c} onClick={() => set('color', c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${form.color === c ? 'border-zinc-900 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">Save</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

// ---- Task Form ----
function TaskForm({ projectId, workStreamId, team, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name: '', description: '', start_date: '', end_date: '',
    status: 'not_started', assignee_id: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave({ ...form, assignee_id: form.assignee_id || null });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Task Name</label>
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Moodboard research" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Start</label>
          <input className="input" type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} required />
        </div>
        <div>
          <label className="label">End</label>
          <input className="input" type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Assignee</label>
          <select className="input" value={form.assignee_id} onChange={(e) => set('assignee_id', e.target.value)}>
            <option value="">Unassigned</option>
            {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">Save</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

// ---- Milestone Form ----
function MilestoneForm({ projectId, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', date: '', status: 'upcoming', notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(form);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Milestone</label>
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Logo concepts presented" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">Save</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

// ---- Main Page ----
export default function ProjectDetail() {
  const { id } = useParams();
  const { project, loading, reload } = useProject(id);
  const { team } = useTeam();

  const [view, setView] = useState('timeline'); // 'timeline' | 'workstreams'
  const [modal, setModal] = useState(null); // { type, data }

  if (loading) return <div className="p-8 text-zinc-400 text-sm">Loading...</div>;
  if (!project) return <div className="p-8 text-zinc-500">Project not found.</div>;

  const clientUrl = `${window.location.origin}/client/${id}`;

  // Handlers
  async function saveWorkStream(form) {
    if (modal.data?.id) {
      await api.updateWorkStream(id, modal.data.id, form);
    } else {
      await api.createWorkStream(id, form);
    }
    reload();
  }

  async function deleteWorkStream(wsId) {
    if (!confirm('Delete this work stream and all its tasks?')) return;
    await api.deleteWorkStream(id, wsId);
    reload();
  }

  async function saveTask(form) {
    const wsId = modal.wsId;
    if (modal.data?.id) {
      await api.updateTask(id, wsId, modal.data.id, form);
    } else {
      await api.createTask(id, wsId, form);
    }
    reload();
  }

  async function deleteTask(wsId, taskId) {
    if (!confirm('Delete this task?')) return;
    await api.deleteTask(id, wsId, taskId);
    reload();
  }

  async function saveMilestone(form) {
    if (modal.data?.id) {
      await api.updateMilestone(id, modal.data.id, form);
    } else {
      await api.createMilestone(id, form);
    }
    reload();
  }

  async function deleteMilestone(mId) {
    if (!confirm('Delete this milestone?')) return;
    await api.deleteMilestone(id, mId);
    reload();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-5 border-b border-zinc-200 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
              <Link to="/" className="hover:text-zinc-600">Projects</Link>
              <span>/</span>
              <span className="text-zinc-700">{project.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-zinc-900">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="text-sm text-zinc-500 mt-0.5">
              {project.client_name} &middot; {format(new Date(project.start_date), 'MMM d')} – {format(new Date(project.end_date), 'MMM d, yyyy')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={clientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs"
              title="Open client-facing view"
            >
              Client View
            </a>
            <button className="btn-primary text-xs" onClick={() => setModal({ type: 'milestone' })}>
              + Milestone
            </button>
            <button className="btn-primary text-xs" onClick={() => setModal({ type: 'workstream' })}>
              + Work Stream
            </button>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex gap-1 mt-4">
          {[['timeline', 'Timeline'], ['workstreams', 'Work Streams & Tasks']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === v ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {view === 'timeline' ? (
          <div className="space-y-6">
            {/* Gantt */}
            <div className="card p-4">
              <h2 className="font-medium text-zinc-700 mb-4 text-sm">Gantt Timeline</h2>
              <GanttView project={project} />
            </div>

            {/* Milestones summary */}
            {project.milestones?.length > 0 && (
              <div className="card p-4">
                <h2 className="font-medium text-zinc-700 mb-3 text-sm">Milestones</h2>
                <div className="space-y-2">
                  {project.milestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-4 py-2 border-b border-zinc-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          m.status === 'completed' ? 'bg-emerald-500' :
                          m.status === 'missed' ? 'bg-red-500' : 'bg-amber-400'
                        }`} />
                        <span className="text-sm text-zinc-800">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-zinc-400">{format(new Date(m.date), 'MMM d, yyyy')}</span>
                        <StatusBadge status={m.status} />
                        <div className="flex gap-1">
                          <button className="text-xs text-zinc-400 hover:text-zinc-700" onClick={() => setModal({ type: 'milestone', data: m })}>Edit</button>
                          <button className="text-xs text-red-400 hover:text-red-700" onClick={() => deleteMilestone(m.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {project.work_streams?.length === 0 && (
              <div className="card py-12 text-center text-zinc-400 text-sm">
                No work streams yet. Add one using the button above.
              </div>
            )}
            {project.work_streams?.map((ws) => (
              <div key={ws.id} className="card overflow-hidden">
                {/* Work stream header */}
                <div
                  className="px-5 py-3 flex items-center justify-between border-l-4"
                  style={{ borderColor: ws.color }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-zinc-900 text-sm">{ws.name}</span>
                    <StatusBadge status={ws.status} />
                    <span className="text-xs text-zinc-400">
                      {format(new Date(ws.start_date), 'MMM d')} – {format(new Date(ws.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="btn-secondary text-xs"
                      onClick={() => setModal({ type: 'task', wsId: ws.id })}
                    >
                      + Task
                    </button>
                    <button
                      className="btn-secondary text-xs"
                      onClick={() => setModal({ type: 'workstream', data: ws })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger text-xs"
                      onClick={() => deleteWorkStream(ws.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Tasks */}
                {ws.tasks?.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-zinc-50 text-xs text-zinc-500 uppercase tracking-wide">
                        <th className="text-left px-5 py-2 font-medium">Task</th>
                        <th className="text-left px-4 py-2 font-medium">Assignee</th>
                        <th className="text-left px-4 py-2 font-medium">Dates</th>
                        <th className="text-left px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {ws.tasks.map((task) => (
                        <tr key={task.id} className="border-t border-zinc-100 hover:bg-zinc-50 group">
                          <td className="px-5 py-2.5 text-zinc-800">{task.name}</td>
                          <td className="px-4 py-2.5">
                            {task.assignee_name ? (
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                  style={{ backgroundColor: task.assignee_color }}
                                >
                                  {task.assignee_name[0]}
                                </span>
                                <span className="text-zinc-700">{task.assignee_name}</span>
                              </span>
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-zinc-500 whitespace-nowrap">
                            {format(new Date(task.start_date), 'MMM d')} – {format(new Date(task.end_date), 'MMM d')}
                          </td>
                          <td className="px-4 py-2.5"><StatusBadge status={task.status} /></td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="text-xs text-zinc-400 hover:text-zinc-700"
                                onClick={() => setModal({ type: 'task', wsId: ws.id, data: task })}
                              >Edit</button>
                              <button
                                className="text-xs text-red-400 hover:text-red-700"
                                onClick={() => deleteTask(ws.id, task.id)}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-5 py-4 text-xs text-zinc-400">No tasks yet.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'workstream' && (
        <Modal title={modal.data ? 'Edit Work Stream' : 'New Work Stream'} onClose={() => setModal(null)}>
          <WorkStreamForm
            projectId={id}
            initial={modal.data}
            onSave={saveWorkStream}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
      {modal?.type === 'task' && (
        <Modal title={modal.data ? 'Edit Task' : 'New Task'} onClose={() => setModal(null)}>
          <TaskForm
            projectId={id}
            workStreamId={modal.wsId}
            team={team}
            initial={modal.data}
            onSave={saveTask}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
      {modal?.type === 'milestone' && (
        <Modal title={modal.data ? 'Edit Milestone' : 'New Milestone'} onClose={() => setModal(null)}>
          <MilestoneForm
            projectId={id}
            initial={modal.data}
            onSave={saveMilestone}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
