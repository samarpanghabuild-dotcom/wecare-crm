import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateLeadId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `WCF${year}${random}`;
}

export async function POST(req: Request) {
  // ── Auth: shared secret ───────────────────────────────────────────────────
  const secret = req.headers.get('x-webhook-secret');
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // ── Field mapping: landing page → CRM schema ──────────────────────────────
  const {
    full_name,    // → customerName
    mobile,
    email,
    address,      // → appended to remarks
    city,
    pan,          // → appended to remarks
    aadhaar,      // → appended to remarks
    income,       // → appended to remarks
    employment,   // → employmentType
    loan_amount,  // → appended to remarks + loanAmount (numeric if parseable)
    source,       // optional override, defaults to "Website"
  } = body;

  if (!full_name || !mobile) {
    return NextResponse.json({ ok: false, error: 'full_name and mobile are required' }, { status: 400 });
  }

  // Build a rich remarks string so no data is lost
  const remarkParts: string[] = ['[Website Lead]'];
  if (address)     remarkParts.push(`Address: ${address}`);
  if (pan)         remarkParts.push(`PAN: ${pan}`);
  if (aadhaar)     remarkParts.push(`Aadhaar: ${aadhaar}`);
  if (income)      remarkParts.push(`Monthly Income: ${income}`);
  if (loan_amount) remarkParts.push(`Loan Required: ${loan_amount}`);

  // Try to extract a numeric loan amount (e.g. "₹2 Lakhs – ₹5 Lakhs" → null, "500000" → 500000)
  const parsedLoan = parseFloat(String(loan_amount || '').replace(/[^0-9.]/g, '')) || null;

  // Find admin user to assign website leads to
  let assignee = await prisma.user.findFirst({
    where: { role: 'ADMIN', isActive: true },
    select: { id: true },
  });
  if (!assignee) {
    assignee = await prisma.user.findFirst({ select: { id: true } });
  }
  if (!assignee) {
    return NextResponse.json({ ok: false, error: 'No users in CRM yet' }, { status: 500 });
  }

  // Generate unique lead ID with collision retry
  let leadId = generateLeadId();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.lead.findUnique({ where: { leadId } });
    if (!exists) break;
    leadId = generateLeadId();
  }

  const lead = await prisma.lead.create({
    data: {
      leadId,
      customerName:    full_name.trim(),
      mobile:          mobile.trim(),
      email:           email?.trim() || null,
      city:            city?.trim() || null,
      productType:     'Personal Loan',
      leadSource:      source || 'Website',
      employmentType:  employment?.trim() || null,
      leadStatus:      'New Lead',
      loanAmount:      parsedLoan,
      remarks:         remarkParts.join('\n'),
      assignedToId:    assignee.id,
      createdById:     assignee.id,
      lastUpdatedById: assignee.id,
    },
    select: {
      id: true,
      leadId: true,
      customerName: true,
      leadStatus: true,
      createdAt: true,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: { leadId: lead.id, userId: assignee.id, action: 'CREATED_VIA_WEBHOOK', changes: 'Source: landing page' },
  });

  return NextResponse.json({ ok: true, leadId: lead.leadId, id: lead.id }, { status: 201 });
}
