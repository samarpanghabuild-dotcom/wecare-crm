'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/AppLayout';
import { LeadForm } from '@/components/LeadForm';
import { STATUS_COLORS, RESULT_COLORS, formatDate, formatCurrency } from '@/lib/utils';
import { ArrowLeft, Edit3, X, Clock } from 'lucide-react';

export function LeadDetailClient({ id }: { id: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(d => { setLead(d); setLoading(false); })
      .catch(() => { setError('Lead not found'); setLoading(false); });
  }, [id]);

  async function handleUpdate(data: any) {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update');
    }
    const updated = await res.json();
    setLead({ ...updated, auditLogs: lead?.auditLogs });
    setEditMode(false);
  }

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    </AppLayout>
  );

  if (error || !lead) return (
    <AppLayout>
      <div className="text-center py-20 text-gray-500">{error || 'Lead not found'}</div>
    </AppLayout>
  );

  if (editMode) return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Lead</h1>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">{lead.leadId}</p>
          </div>
          <button onClick={() => setEditMode(false)} className="btn-secondary">
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
        <LeadForm initialData={lead} onSubmit={handleUpdate} isEdit />
      </div>
    </AppLayout>
  );

  function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:w-40 flex-shrink-0">{label}</dt>
        <dd className="text-sm text-gray-900 dark:text-gray-100">{value || '-'}</dd>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => router.back()} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lead.customerName}</h1>
              <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{lead.leadId}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 ml-8 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.leadStatus] || 'bg-gray-100 text-gray-700'}`}>
                {lead.leadStatus}
              </span>
              {lead.fileResult && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RESULT_COLORS[lead.fileResult] || ''}`}>
                  {lead.fileResult}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setEditMode(true)} className="btn-primary flex-shrink-0">
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h3>
              <dl>
                <InfoRow label="Mobile" value={lead.mobile} />
                <InfoRow label="Alt Mobile" value={lead.altMobile} />
                <InfoRow label="Email" value={lead.email} />
                <InfoRow label="City" value={lead.city} />
                <InfoRow label="State" value={lead.state} />
                <InfoRow label="Pincode" value={lead.pincode} />
              </dl>
            </div>

            {/* Lead Info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Lead Information</h3>
              <dl>
                <InfoRow label="Product Type" value={lead.productType} />
                {lead.insuranceCategory && <InfoRow label="Insurance Category" value={lead.insuranceCategory} />}
                <InfoRow label="Lead Source" value={lead.leadSource} />
                <InfoRow label="Employment Type" value={lead.employmentType} />
                <InfoRow label="Branch" value={lead.branch} />
                <InfoRow label="Region" value={lead.region} />
                <InfoRow label="Assigned To" value={lead.assignedTo?.name} />
              </dl>
            </div>

            {/* File Result */}
            {lead.fileResult && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">File Result</h3>
                <dl>
                  <InfoRow label="File Result" value={
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RESULT_COLORS[lead.fileResult] || ''}`}>{lead.fileResult}</span>
                  } />
                  {lead.approvalAmount && <InfoRow label="Approval Amount" value={formatCurrency(lead.approvalAmount)} />}
                  {lead.loanAmount && <InfoRow label="Loan Amount" value={formatCurrency(lead.loanAmount)} />}
                  {lead.premiumAmount && <InfoRow label="Premium Amount" value={formatCurrency(lead.premiumAmount)} />}
                  {lead.rejectionReason && <InfoRow label="Rejection Reason" value={lead.rejectionReason} />}
                  {lead.customRejectionReason && <InfoRow label="Custom Reason" value={lead.customRejectionReason} />}
                </dl>
              </div>
            )}

            {/* Remarks */}
            {(lead.remarks || lead.nextFollowUpDate) && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Follow Up</h3>
                <dl>
                  {lead.nextFollowUpDate && <InfoRow label="Next Follow Up" value={formatDate(lead.nextFollowUpDate)} />}
                  {lead.remarks && <InfoRow label="Remarks" value={lead.remarks} />}
                </dl>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meta */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Timeline</h3>
              <dl className="space-y-2">
                <InfoRow label="Created" value={formatDate(lead.createdAt)} />
                <InfoRow label="Updated" value={formatDate(lead.updatedAt)} />
                <InfoRow label="Created By" value={lead.createdBy?.name} />
              </dl>
            </div>

            {/* Audit Log */}
            {lead.auditLogs?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Audit Log
                </h3>
                <div className="space-y-3">
                  {lead.auditLogs.map((log: any) => (
                    <div key={log.id} className="text-xs border-l-2 border-blue-200 dark:border-blue-800 pl-3">
                      <p className="font-medium text-gray-700 dark:text-gray-300">{log.action}</p>
                      {log.changes && <p className="text-gray-500 dark:text-gray-400 mt-0.5">{log.changes}</p>}
                      <p className="text-gray-400 dark:text-gray-500 mt-0.5">{log.user?.name} · {formatDate(log.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
