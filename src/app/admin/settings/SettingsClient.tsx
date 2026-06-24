'use client';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

const DROPDOWN_TYPES = [
  { key: 'productType', label: 'Product Types' },
  { key: 'insuranceCategory', label: 'Insurance Categories' },
  { key: 'leadSource', label: 'Lead Sources' },
  { key: 'employmentType', label: 'Employment Types' },
  { key: 'leadStatus', label: 'Lead Statuses' },
  { key: 'rejectionReason', label: 'Rejection Reasons' },
  { key: 'branch', label: 'Branches' },
  { key: 'region', label: 'Regions' },
];

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState('productType');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadItems(type: string) {
    setLoading(true);
    const res = await fetch(`/api/dropdowns?type=${type}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { loadItems(activeTab); }, [activeTab]);

  async function addItem() {
    if (!newLabel.trim()) return;
    setSaving(true);
    const value = newLabel.trim().toLowerCase().replace(/\s+/g, '-');
    await fetch('/api/dropdowns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: activeTab, value, label: newLabel.trim(), sortOrder: items.length }),
    });
    setNewLabel('');
    await loadItems(activeTab);
    setSaving(false);
  }

  async function toggleItem(item: any) {
    await fetch('/api/dropdowns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
    });
    loadItems(activeTab);
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this option? This may affect existing leads.')) return;
    await fetch(`/api/dropdowns?id=${id}`, { method: 'DELETE' });
    loadItems(activeTab);
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage dropdown options for the lead form</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 h-fit">
            <nav className="space-y-1">
              {DROPDOWN_TYPES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); setNewLabel(''); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === key
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {DROPDOWN_TYPES.find(t => t.key === activeTab)?.label}
                </h2>
                <span className="text-xs text-gray-500">{items.filter(i => i.isActive).length} active</span>
              </div>

              {/* Add new */}
              <div className="flex gap-2 mb-4">
                <input
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                  placeholder="Add new option..."
                  className="input flex-1"
                />
                <button onClick={addItem} disabled={saving || !newLabel.trim()} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add
                </button>
              </div>

              {/* List */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
                      item.isActive
                        ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50'
                        : 'border-dashed border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-50'
                    }`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.value}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleItem(item)} className="p-1.5 rounded text-gray-400 hover:text-blue-600" title={item.isActive ? 'Deactivate' : 'Activate'}>
                          {item.isActive ? <ToggleRight className="w-5 h-5 text-blue-500" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-6">No options yet. Add one above.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
