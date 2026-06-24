'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

interface DropdownItem { id: string; type: string; value: string; label: string; }

interface LeadFormProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void>;
  isEdit?: boolean;
}

export function LeadForm({ initialData, onSubmit, isEdit }: LeadFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [dropdowns, setDropdowns] = useState<Record<string, DropdownItem[]>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerName: '', mobile: '', altMobile: '', email: '',
    city: '', state: '', pincode: '',
    productType: '', insuranceCategory: '', leadSource: '',
    employmentType: '', leadStatus: 'New Lead',
    fileResult: '', rejectionReason: '', customRejectionReason: '',
    approvalAmount: '', loanAmount: '', premiumAmount: '',
    remarks: '', branch: '', region: '',
    ...initialData,
    nextFollowUpDate: initialData?.nextFollowUpDate
      ? new Date(initialData.nextFollowUpDate).toISOString().split('T')[0]
      : '',
    assignedToId: initialData?.assignedToId || initialData?.assignedTo?.id || '',
  });

  useEffect(() => {
    fetch('/api/dropdowns')
      .then(r => r.json())
      .then(items => {
        const map: Record<string, DropdownItem[]> = {};
        items.forEach((i: DropdownItem) => { if (!map[i.type]) map[i.type] = []; map[i.type].push(i); });
        setDropdowns(map);
      });

    if (role === 'ADMIN') {
      fetch('/api/users').then(r => r.json()).then(setUsers);
    }
  }, [role]);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const showInsuranceCategory = form.productType === 'Insurance';
  const showPositiveFields = form.fileResult === 'Positive';
  const showNegativeFields = form.fileResult === 'Negative';
  const showCustomRejection = form.rejectionReason === 'Other';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (onSubmit) {
        await onSubmit(form);
      } else {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to save');
        }
        const lead = await res.json();
        router.push(`/leads/${lead.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save lead');
    }
    setSaving(false);
  }

  function Select({ field, options, placeholder, required }: { field: string; options: string[] | DropdownItem[]; placeholder: string; required?: boolean }) {
    return (
      <select className="input" value={(form as any)[field]} onChange={e => set(field, e.target.value)} required={required}>
        <option value="">{placeholder}</option>
        {(options as any[]).map(opt => typeof opt === 'string'
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
        )}
      </select>
    );
  }

  function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
      <div>
        <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        {children}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Customer Name" required>
            <input className="input" value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Full name" required />
          </Field>
          <Field label="Mobile" required>
            <input className="input" value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="10-digit mobile" required pattern="[0-9]{10}" />
          </Field>
          <Field label="Alternate Mobile">
            <input className="input" value={form.altMobile} onChange={e => set('altMobile', e.target.value)} placeholder="Alternate mobile" />
          </Field>
          <Field label="Email">
            <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
          </Field>
          <Field label="City">
            <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
          </Field>
          <Field label="State">
            <input className="input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" />
          </Field>
          <Field label="Pincode">
            <input className="input" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="6-digit pincode" maxLength={6} />
          </Field>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Lead Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Product Type" required>
            <Select field="productType" options={dropdowns.productType || []} placeholder="Select product" required />
          </Field>
          {showInsuranceCategory && (
            <Field label="Insurance Category">
              <Select field="insuranceCategory" options={dropdowns.insuranceCategory || []} placeholder="Select category" />
            </Field>
          )}
          <Field label="Lead Source" required>
            <Select field="leadSource" options={dropdowns.leadSource || []} placeholder="Select source" required />
          </Field>
          <Field label="Employment Type">
            <Select field="employmentType" options={dropdowns.employmentType || []} placeholder="Select employment" />
          </Field>
          <Field label="Lead Status">
            <Select field="leadStatus" options={dropdowns.leadStatus || []} placeholder="Select status" />
          </Field>
          <Field label="Branch">
            <Select field="branch" options={dropdowns.branch || []} placeholder="Select branch" />
          </Field>
          <Field label="Region">
            <Select field="region" options={dropdowns.region || []} placeholder="Select region" />
          </Field>
          {role === 'ADMIN' && (
            <Field label="Assigned Executive">
              <select className="input" value={form.assignedToId} onChange={e => set('assignedToId', e.target.value)}>
                <option value="">Self (me)</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </Field>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">File Result</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="File Result">
            <Select field="fileResult" options={['Positive', 'Negative', 'Pending']} placeholder="Select result" />
          </Field>
          {showPositiveFields && (
            <>
              <Field label="Approval Amount (Rs.)">
                <input className="input" type="number" value={form.approvalAmount} onChange={e => set('approvalAmount', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Loan Amount (Rs.)">
                <input className="input" type="number" value={form.loanAmount} onChange={e => set('loanAmount', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Premium Amount (Rs.)">
                <input className="input" type="number" value={form.premiumAmount} onChange={e => set('premiumAmount', e.target.value)} placeholder="0" />
              </Field>
            </>
          )}
          {showNegativeFields && (
            <>
              <Field label="Rejection Reason">
                <Select field="rejectionReason" options={dropdowns.rejectionReason || []} placeholder="Select reason" />
              </Field>
              {showCustomRejection && (
                <Field label="Custom Rejection Reason">
                  <input className="input" value={form.customRejectionReason} onChange={e => set('customRejectionReason', e.target.value)} placeholder="Describe reason..." />
                </Field>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Follow Up & Remarks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Next Follow Up Date">
            <input className="input" type="date" value={form.nextFollowUpDate} onChange={e => set('nextFollowUpDate', e.target.value)} />
          </Field>
          <Field label="Remarks">
            <textarea className="input min-h-[80px] resize-none" value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Add any notes or remarks..." />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : isEdit ? 'Update Lead' : 'Save Lead'}
        </button>
      </div>
    </form>
  );
}
