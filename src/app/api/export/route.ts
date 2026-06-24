import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const where = role === 'ADMIN' ? {} : { assignedToId: userId };

  const leads = await prisma.lead.findMany({
    where,
    include: { assignedTo: { select: { name: true } }, createdBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const headers = [
    'Lead ID', 'Date', 'Executive Name', 'Customer Name', 'Mobile', 'Alternate Mobile',
    'Email', 'City', 'State', 'Pincode', 'Product Type', 'Insurance Category',
    'Lead Source', 'Employment Type', 'Lead Status', 'File Result', 'Rejection Reason',
    'Custom Rejection Reason', 'Approval Amount', 'Loan Amount', 'Premium Amount',
    'Next Follow Up Date', 'Remarks', 'Branch', 'Region', 'Last Updated Date', 'Last Updated By',
  ];

  const rows = leads.map(l => [
    l.leadId,
    l.date ? new Date(l.date).toLocaleDateString('en-IN') : '',
    l.assignedTo?.name || '',
    l.customerName,
    l.mobile,
    l.altMobile || '',
    l.email || '',
    l.city || '',
    l.state || '',
    l.pincode || '',
    l.productType,
    l.insuranceCategory || '',
    l.leadSource,
    l.employmentType || '',
    l.leadStatus,
    l.fileResult || '',
    l.rejectionReason || '',
    l.customRejectionReason || '',
    l.approvalAmount ? l.approvalAmount.toString() : '',
    l.loanAmount ? l.loanAmount.toString() : '',
    l.premiumAmount ? l.premiumAmount.toString() : '',
    l.nextFollowUpDate ? new Date(l.nextFollowUpDate).toLocaleDateString('en-IN') : '',
    l.remarks || '',
    l.branch || '',
    l.region || '',
    l.updatedAt ? new Date(l.updatedAt).toLocaleDateString('en-IN') : '',
    l.lastUpdatedById || '',
  ]);

  const csvLines = [headers, ...rows].map(row =>
    row.map(cell => {
      const s = String(cell).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(',')
  );

  const csv = csvLines.join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
