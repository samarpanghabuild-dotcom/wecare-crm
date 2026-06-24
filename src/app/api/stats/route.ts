import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const baseWhere = role === 'ADMIN' ? {} : { assignedToId: userId };

  const [total, newLeads, approved, rejected, disbursed, policyIssued, byProduct, byStatus, bySource] = await Promise.all([
    prisma.lead.count({ where: baseWhere }),
    prisma.lead.count({ where: { ...baseWhere, leadStatus: 'New Lead' } }),
    prisma.lead.count({ where: { ...baseWhere, leadStatus: 'Approved' } }),
    prisma.lead.count({ where: { ...baseWhere, leadStatus: 'Rejected' } }),
    prisma.lead.count({ where: { ...baseWhere, leadStatus: 'Disbursed' } }),
    prisma.lead.count({ where: { ...baseWhere, leadStatus: 'Policy Issued' } }),
    prisma.lead.groupBy({ by: ['productType'], where: baseWhere, _count: true, orderBy: { _count: { productType: 'desc' } }, take: 10 }),
    prisma.lead.groupBy({ by: ['leadStatus'], where: baseWhere, _count: true }),
    prisma.lead.groupBy({ by: ['leadSource'], where: baseWhere, _count: true, orderBy: { _count: { leadSource: 'desc' } }, take: 8 }),
  ]);

  const conversionRate = total > 0 ? Math.round(((approved + disbursed + policyIssued) / total) * 100) : 0;

  // Monthly trend: get all leads with createdAt, group in JS
  const allLeads = await prisma.lead.findMany({
    where: baseWhere,
    select: { createdAt: true },
  });

  const monthCounts: Record<string, number> = {};
  for (const lead of allLeads) {
    const d = new Date(lead.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  }

  const now = new Date();
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyTrend.push({ month: key, count: monthCounts[key] || 0 });
  }

  return NextResponse.json({
    summary: { total, newLeads, approved, rejected, disbursed, policyIssued, conversionRate },
    byProduct: byProduct.map(p => ({ name: p.productType, value: p._count })),
    byStatus: byStatus.map(s => ({ name: s.leadStatus, value: s._count })),
    bySource: bySource.map(s => ({ name: s.leadSource, value: s._count })),
    monthlyTrend,
  });
}
