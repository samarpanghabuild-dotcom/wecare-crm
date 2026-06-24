'use client';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { UserPlus, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function UsersClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dropdowns, setDropdowns] = useState<Record<string, any[]>>({});
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ASSOCIATE', branch: '', region: '' });

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(d); setLoading(false); });
    fetch('/api/dropdowns').then(r => r.json()).then(items => {
      const map: Record<string, any[]> = {};
      items.forEach((i: any) => { if (!map[i.type]) map[i.type] = []; map[i.type].push(i); });
      setDropdowns(map);
    });
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const user = await res.json();
      setUsers(u => [...u, user]);
      setForm({ name: '', email: '', password: '', role: 'ASSOCIATE', branch: '', region: '' });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function toggleUser(user: any) {
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name: user.name, isActive: !user.isActive }),
    });
    setUsers(us => us.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage CRM users and their roles</p>
          </div>
          <button onClick={() => setShowForm(f => !f)} className="btn-primary">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Add user form */}
        {showForm && (
          <form onSubmit={createUser} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Full name" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="email@example.com" />
              </div>
              <div>
                <label className="label">Password *</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Min 6 characters" minLength={6} />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="ASSOCIATE">Associate</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="label">Branch</label>
                <select className="input" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
                  <option value="">Select branch</option>
                  {(dropdowns.branch || []).map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Region</label>
                <select className="input" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                  <option value="">Select region</option>
                  {(dropdowns.region || []).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create User
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {/* Users table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Branch</th>
                <th className="table-header">Region</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="table-cell text-center py-8 text-gray-400">Loading...</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="table-cell font-medium">{user.name}</td>
                  <td className="table-cell text-gray-500">{user.email}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="table-cell">{user.branch || '-'}</td>
                  <td className="table-cell">{user.region || '-'}</td>
                  <td className="table-cell">
                    <span className={`flex items-center gap-1 text-xs ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {user.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button onClick={() => toggleUser(user)} className={`text-xs px-2 py-1 rounded ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
