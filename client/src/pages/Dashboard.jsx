import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useProjects, useClients, api } from '../hooks/useApi';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const STATUS_OPTIONS = ['active', 'on_hold', 'completed', 'cancelled'];

function ProjectForm({ clients, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    client_id: clients[0]?.id || '',
    name: '',
    description: '',
    status: 'active',
    start_date: '',
    end_date: '',
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
        <label className="label">Client</label>
        <select className="input" value={form.client_id} onChange={(e) => set('client_id', e.target.value)} required>
          <option value="">Select client...</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Project Name</label>
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Brand Identity Refresh" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Optional project notes..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Start Date</label>
          <input className="input" type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} required />
        </div>
        <div>
          <label className="label">End Date</label>
          <input className="input" type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="label">Status</label>
        <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">Save Project</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default function Dashboard() {
  const { projects, loading, reload } = useProjects();
  const { clients } = useClients();
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);

  async function handleCreate(form) {
    await api.createProject(form);
    reload();
  }

  async function handleUpdate(form) {
    await api.updateProject(editing.id, form);
    setEditing(null);
    reload();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project and all its data?')) return;
    await api.deleteProject(id);
    reload();
  }

  const stats = {
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    on_hold: projects.filter((p) => p.status === 'on_hold').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Projects</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage all client projects and timelines</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          <PlusIcon />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active', value: stats.active, color: 'text-emerald-600' },
          { label: 'On Hold', value: stats.on_hold, color: 'text-amber-600' },
          { label: 'Completed', value: stats.completed, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card px-5 py-4">
            <div className={`text-2xl font-semibold ${color}`}>{value}</div>
            <div className="text-sm text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-zinc-100 p-1 rounded-lg w-fit">
        {['all', 'active', 'on_hold', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === s ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Project list */}
      {loading ? (
        <div className="text-zinc-400 py-12 text-center text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="text-zinc-400 text-sm">No projects yet.</div>
          {clients.length === 0 && (
            <div className="text-zinc-400 text-xs mt-2">
              Add a client first via the <Link to="/clients" className="underline">Clients</Link> page.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="card px-5 py-4 flex items-center gap-4 hover:border-zinc-300 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link
                    to={`/projects/${p.id}`}
                    className="font-medium text-zinc-900 hover:text-zinc-600 truncate"
                  >
                    {p.name}
                  </Link>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-sm text-zinc-500">
                  {p.client_name} &middot; {format(new Date(p.start_date), 'MMM d, yyyy')} – {format(new Date(p.end_date), 'MMM d, yyyy')}
                </div>
                {p.description && (
                  <div className="text-sm text-zinc-400 mt-0.5 truncate">{p.description}</div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/projects/${p.id}`}
                  className="btn-secondary text-xs"
                >
                  Open
                </Link>
                <button
                  className="btn-secondary text-xs"
                  onClick={() => setEditing(p)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger text-xs"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <Modal title="New Project" onClose={() => setShowNew(false)}>
          {clients.length === 0 ? (
            <div className="text-sm text-zinc-500">
              You need to add at least one client before creating a project.{' '}
              <Link to="/clients" className="underline">Go to Clients</Link>
            </div>
          ) : (
            <ProjectForm clients={clients} onSave={handleCreate} onClose={() => setShowNew(false)} />
          )}
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Project" onClose={() => setEditing(null)}>
          <ProjectForm
            clients={clients}
            initial={{ ...editing }}
            onSave={handleUpdate}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
