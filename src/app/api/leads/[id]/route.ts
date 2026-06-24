import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      auditLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (role !== 'ADMIN' && lead.assignedToId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(lead);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const body = await req.json();

  const existing = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (role !== 'ADMIN' && existing.assignedToId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Build changes log
  const changes: string[] = [];
  const fields = ['leadStatus', 'fileResult', 'remarks', 'rejectionReason'];
  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== (existing as any)[f]) {
      changes.push(`${f}: ${(existing as any)[f]} → ${body[f]}`);
    }
  }

  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: {
      customerName: body.customerName ?? existing.customerName,
      mobile: body.mobile ?? existing.mobile,
      altMobile: body.altMobile ?? existing.altMobile,
      email: body.email ?? existing.email,
      city: body.city ?? existing.city,
      state: body.state ?? existing.state,
      pincode: body.pincode ?? existing.pincode,
      productType: body.productType ?? existing.productType,
      insuranceCategory: body.insuranceCategory ?? existing.insuranceCategory,
      leadSource: body.leadSource ?? existing.leadSource,
      employmentType: body.employmentType ?? existing.employmentType,
      leadStatus: body.leadStatus ?? existing.leadStatus,
      fileResult: body.fileResult ?? existing.fileResult,
      rejectionReason: body.rejectionReason ?? existing.rejectionReason,
      customRejectionReason: body.customRejectionReason ?? existing.customRejectionReason,
      approvalAmount: body.approvalAmount ? parseFloat(body.approvalAmount) : existing.approvalAmount,
      loanAmount: body.loanAmount ? parseFloat(body.loanAmount) : existing.loanAmount,
      premiumAmount: body.premiumAmount ? parseFloat(body.premiumAmount) : existing.premiumAmount,
      remarks: body.remarks ?? existing.remarks,
      nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : existing.nextFollowUpDate,
      branch: body.branch ?? existing.branch,
      region: body.region ?? existing.region,
      assignedToId: role === 'ADMIN' && body.assignedToId ? body.assignedToId : existing.assignedToId,
      lastUpdatedById: userId,
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  if (changes.length > 0) {
    await prisma.auditLog.create({
      data: { leadId: params.id, userId, action: 'UPDATED', changes: changes.join('; ') },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.auditLog.deleteMany({ where: { leadId: params.id } });
  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
