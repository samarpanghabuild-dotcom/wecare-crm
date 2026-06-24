'use client';
import { AppLayout } from '@/components/AppLayout';
import { LeadForm } from '@/components/LeadForm';

export function NewLeadClient() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Lead</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details to create a new lead</p>
        </div>
        <LeadForm />
      </div>
    </AppLayout>
  );
}
