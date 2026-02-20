import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClients, useProjects, api } from '../hooks/useApi';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

function ClientForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', contact_name: '', contact_email: '', notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(form);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Company / Client Name</label>
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Acme Corp" />
      </div>
      <div>
        <label className="label">Contact Name</label>
        <input className="input" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} placeholder="Jane Smith" />
      </div>
      <div>
        <label className="label">Contact Email</label>
        <input className="input" type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} placeholder="jane@acme.com" />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input resize-none" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Any notes about this client..." />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">Save Client</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default function ClientsPage() {
  const { clients, loading, reload } = useClients();
  const { projects } = useProjects();
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);

  function projectsForClient(clientId) {
    return projects.filter((p) => p.client_id === clientId);
  }

  async function handleCreate(form) {
    await api.createClient(form);
    reload();
  }

  async function handleUpdate(form) {
    await api.updateClient(editing.id, form);
    setEditing(null);
    reload();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this client? This will also delete all their projects.')) return;
    await api.deleteClient(id);
    reload();
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Clients</h1>
          <p className="text-sm text-zinc-500 mt-1">All client accounts and their projects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          + Add Client
        </button>
      </div>

      {loading ? (
        <div className="text-zinc-400 text-sm">Loading...</div>
      ) : clients.length === 0 ? (
        <div className="card py-16 text-center text-zinc-400 text-sm">
          No clients yet. Add your first client to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((c) => {
            const clientProjects = projectsForClient(c.id);
            return (
              <div key={c.id} className="card px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-zinc-900 text-base">{c.name}</div>
                    {c.contact_name && (
                      <div className="text-sm text-zinc-500 mt-0.5">
                        {c.contact_name}
                        {c.contact_email && (
                          <> &middot; <a href={`mailto:${c.contact_email}`} className="hover:underline">{c.contact_email}</a></>
                        )}
                      </div>
                    )}
                    {c.notes && <div className="text-sm text-zinc-400 mt-1">{c.notes}</div>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button className="btn-secondary text-xs" onClick={() => setEditing(c)}>Edit</button>
                    <button className="btn-danger text-xs" onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </div>

                {clientProjects.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Projects</div>
                    <div className="flex flex-wrap gap-2">
                      {clientProjects.map((p) => (
                        <Link
                          key={p.id}
                          to={`/projects/${p.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors text-sm"
                        >
                          <span className="text-zinc-800">{p.name}</span>
                          <StatusBadge status={p.status} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showNew && (
        <Modal title="Add Client" onClose={() => setShowNew(false)}>
          <ClientForm onSave={handleCreate} onClose={() => setShowNew(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Client" onClose={() => setEditing(null)}>
          <ClientForm initial={editing} onSave={handleUpdate} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
