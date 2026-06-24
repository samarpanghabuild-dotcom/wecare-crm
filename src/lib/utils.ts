import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateLeadId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `WCF${year}${random}`;
}

export function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const STATUS_COLORS: Record<string, string> = {
  'New Lead': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-yellow-100 text-yellow-800',
  'Documents Pending': 'bg-orange-100 text-orange-800',
  'Under Process': 'bg-purple-100 text-purple-800',
  'Approved': 'bg-green-100 text-green-800',
  'Disbursed': 'bg-emerald-100 text-emerald-800',
  'Policy Issued': 'bg-teal-100 text-teal-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Cancelled': 'bg-gray-100 text-gray-800',
  'Not Interested': 'bg-slate-100 text-slate-800',
  'Follow Up Required': 'bg-amber-100 text-amber-800',
};

export const RESULT_COLORS: Record<string, string> = {
  'Positive': 'bg-green-100 text-green-800',
  'Negative': 'bg-red-100 text-red-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
};
