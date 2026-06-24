import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateLeadId } from '@/lib/utils';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const product = searchParams.get('product') || '';
  const source = searchParams.get('source') || '';
  const result = searchParams.get('result') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const executive = searchParams.get('executive') || '';

  const where: any = {};

  if (role !== 'ADMIN') {
    where.assignedToId = userId;
  } else if (executive) {
    where.assignedToId = executive;
  }

  if (search) {
    where.OR = [
      { customerName: { contains: search } },
      { mobile: { contains: search } },
      { leadId: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (status) where.leadStatus = status;
  if (product) where.productType = product;
  if (source) where.leadSource = source;
  if (result) where.fileResult = result;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = toDate;
    }
  }

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const body = await req.json();

  // Generate unique lead ID
  let leadId = generateLeadId();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.lead.findUnique({ where: { leadId } });
    if (!existing) break;
    leadId = generateLeadId();
    attempts++;
  }

  const assignedToId = role === 'ADMIN' && body.assignedToId ? body.assignedToId : userId;

  const lead = await prisma.lead.create({
    data: {
      leadId,
      customerName: body.customerName,
      mobile: body.mobile,
      altMobile: body.altMobile || null,
      email: body.email || null,
      city: body.city || null,
      state: body.state || null,
      pincode: body.pincode || null,
      productType: body.productType,
      insuranceCategory: body.insuranceCategory || null,
      leadSource: body.leadSource,
      employmentType: body.employmentType || null,
      leadStatus: body.leadStatus || 'New Lead',
      fileResult: body.fileResult || null,
      rejectionReason: body.rejectionReason || null,
      customRejectionReason: body.customRejectionReason || null,
      approvalAmount: body.approvalAmount ? parseFloat(body.approvalAmount) : null,
      loanAmount: body.loanAmount ? parseFloat(body.loanAmount) : null,
      premiumAmount: body.premiumAmount ? parseFloat(body.premiumAmount) : null,
      remarks: body.remarks || null,
      nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : null,
      branch: body.branch || null,
      region: body.region || null,
      assignedToId,
      createdById: userId,
      lastUpdatedById: userId,
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  // Audit log
  await prisma.auditLog.create({
    data: { leadId: lead.id, userId, action: 'CREATED' },
  });

  return NextResponse.json(lead, { status: 201 });
}
