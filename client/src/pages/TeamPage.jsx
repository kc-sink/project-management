import { useState } from 'react';
import { useTeam, useProjects, api } from '../hooks/useApi';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const MEMBER_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6','#f97316','#84cc16'];

function MemberForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', role: '', email: '', color: MEMBER_COLORS[0] });
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
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Alex Chen" />
      </div>
      <div>
        <label className="label">Role</label>
        <input className="input" value={form.role} onChange={(e) => set('role', e.target.value)} required placeholder="Senior Designer" />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="alex@studio.com" />
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap mt-1">
          {MEMBER_COLORS.map((c) => (
            <button type="button" key={c} onClick={() => set('color', c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${form.color === c ? 'border-zinc-900 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">Save</button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default function TeamPage() {
  const { team, loading, reload } = useTeam();
  const { projects } = useProjects();
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);

  // Compute workload: how many active tasks each member has across all projects
  // We'll just count tasks assigned to each member from the project list
  // (projects list doesn't include tasks, so we just show team cards cleanly)

  async function handleCreate(form) {
    await api.createTeamMember(form);
    reload();
  }

  async function handleUpdate(form) {
    await api.updateTeamMember(editing.id, form);
    setEditing(null);
    reload();
  }

  async function handleDelete(id) {
    if (!confirm('Remove this team member?')) return;
    await api.deleteTeamMember(id);
    reload();
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Team</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your studio team members</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          + Add Member
        </button>
      </div>

      {loading ? (
        <div className="text-zinc-400 text-sm">Loading...</div>
      ) : team.length === 0 ? (
        <div className="card py-16 text-center text-zinc-400 text-sm">No team members yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => (
            <div key={member.id} className="card px-5 py-5 flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {member.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-900">{member.name}</div>
                <div className="text-sm text-zinc-500">{member.role}</div>
                {member.email && (
                  <div className="text-xs text-zinc-400 mt-0.5 truncate">{member.email}</div>
                )}
                <div className="flex gap-1.5 mt-3">
                  <button className="btn-secondary text-xs" onClick={() => setEditing(member)}>Edit</button>
                  <button className="btn-danger text-xs" onClick={() => handleDelete(member.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <Modal title="Add Team Member" onClose={() => setShowNew(false)}>
          <MemberForm onSave={handleCreate} onClose={() => setShowNew(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Edit Team Member" onClose={() => setEditing(null)}>
          <MemberForm initial={editing} onSave={handleUpdate} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
