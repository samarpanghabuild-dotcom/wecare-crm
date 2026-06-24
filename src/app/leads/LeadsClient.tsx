'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PlusCircle, Search, Download, Eye, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { STATUS_COLORS, RESULT_COLORS, formatDate } from '@/lib/utils';

export function LeadsClient() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [product, setProduct] = useState('');
  const [result, setResult] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [dropdowns, setDropdowns] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetch('/api/dropdowns')
      .then(r => r.json())
      .then(items => {
        const map: Record<string, any[]> = {};
        items.forEach((i: any) => { if (!map[i.type]) map[i.type] = []; map[i.type].push(i); });
        setDropdowns(map);
      });
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (product) params.set('product', product);
    if (result) params.set('result', result);
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const res = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    setLeads(data.leads || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, search, status, product, result, from, to]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function deleteLead(id: string) {
    if (!confirm('Delete this lead?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    fetchLeads();
  }

  const exportUrl = `/api/export${search ? `?search=${search}` : ''}`;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{total} total leads</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/export" className="btn-secondary">
              <Download className="w-4 h-4" /> Export
            </a>
            <Link href="/leads/new" className="btn-primary">
              <PlusCircle className="w-4 h-4" /> Add Lead
            </Link>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, mobile, lead ID..."
                className="input pl-9"
              />
            </div>
            <button onClick={() => setShowFilters(f => !f)} className="btn-secondary">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-slate-700">
              <div>
                <label className="label">Status</label>
                <select className="input" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  {(dropdowns.leadStatus || []).map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Product</label>
                <select className="input" value={product} onChange={e => { setProduct(e.target.value); setPage(1); }}>
                  <option value="">All Products</option>
                  {(dropdowns.productType || []).map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">File Result</label>
                <select className="input" value={result} onChange={e => { setResult(e.target.value); setPage(1); }}>
                  <option value="">All Results</option>
                  {['Positive', 'Negative', 'Pending'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Date From</label>
                <input type="date" className="input" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="label">Date To</label>
                <input type="date" className="input" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />
              </div>
              <div className="flex items-end">
                <button onClick={() => { setSearch(''); setStatus(''); setProduct(''); setResult(''); setFrom(''); setTo(''); setPage(1); }} className="btn-secondary w-full">
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="table-header">Lead ID</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Mobile</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Source</th>
                  {role === 'ADMIN' && <th className="table-header">Executive</th>}
                  <th className="table-header">Status</th>
                  <th className="table-header">Result</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loading ? (
                  <tr><td colSpan={10} className="table-cell text-center py-12 text-gray-400">Loading...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={10} className="table-cell text-center py-12 text-gray-400">No leads found</td></tr>
                ) : leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="table-cell font-mono text-xs text-blue-600 dark:text-blue-400">{lead.leadId}</td>
                    <td className="table-cell text-gray-500 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                    <td className="table-cell font-medium">{lead.customerName}</td>
                    <td className="table-cell">{lead.mobile}</td>
                    <td className="table-cell">{lead.productType}</td>
                    <td className="table-cell">{lead.leadSource}</td>
                    {role === 'ADMIN' && <td className="table-cell">{lead.assignedTo?.name}</td>}
                    <td className="table-cell">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.leadStatus] || 'bg-gray-100 text-gray-700'}`}>
                        {lead.leadStatus}
                      </span>
                    </td>
                    <td className="table-cell">
                      {lead.fileResult ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${RESULT_COLORS[lead.fileResult] || ''}`}>
                          {lead.fileResult}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <Link href={`/leads/${lead.id}`} className="p-1.5 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {role === 'ADMIN' && (
                          <button onClick={() => deleteLead(lead.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
