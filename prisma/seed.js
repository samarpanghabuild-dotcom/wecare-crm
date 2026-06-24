const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wecarefinserv.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@wecarefinserv.com',
      password: adminHash,
      role: 'ADMIN',
      branch: 'Head Office',
      region: 'Central',
    },
  });

  // Create associate users
  const hash = await bcrypt.hash('pass123', 10);
  await prisma.user.upsert({
    where: { email: 'rajesh@wecarefinserv.com' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'rajesh@wecarefinserv.com',
      password: hash,
      role: 'ASSOCIATE',
      branch: 'Mumbai',
      region: 'West',
    },
  });
  await prisma.user.upsert({
    where: { email: 'priya@wecarefinserv.com' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'priya@wecarefinserv.com',
      password: hash,
      role: 'ASSOCIATE',
      branch: 'Delhi',
      region: 'North',
    },
  });

  // Seed dropdowns
  const dropdowns = [
    // Product Types
    { type: 'productType', value: 'Insurance', label: 'Insurance', sortOrder: 1 },
    { type: 'productType', value: 'Personal Loan', label: 'Personal Loan', sortOrder: 2 },
    { type: 'productType', value: 'Business Loan', label: 'Business Loan', sortOrder: 3 },
    { type: 'productType', value: 'Home Loan', label: 'Home Loan', sortOrder: 4 },
    { type: 'productType', value: 'Car Loan', label: 'Car Loan', sortOrder: 5 },
    { type: 'productType', value: 'Used Car Loan', label: 'Used Car Loan', sortOrder: 6 },
    { type: 'productType', value: 'Bike Loan', label: 'Bike Loan', sortOrder: 7 },
    { type: 'productType', value: 'Mortgage Loan', label: 'Mortgage Loan', sortOrder: 8 },
    { type: 'productType', value: 'Loan Against Property', label: 'Loan Against Property', sortOrder: 9 },
    { type: 'productType', value: 'Credit Card', label: 'Credit Card', sortOrder: 10 },

    // Insurance Categories
    { type: 'insuranceCategory', value: 'Health', label: 'Health', sortOrder: 1 },
    { type: 'insuranceCategory', value: 'Life', label: 'Life', sortOrder: 2 },
    { type: 'insuranceCategory', value: 'Term', label: 'Term', sortOrder: 3 },
    { type: 'insuranceCategory', value: 'Motor', label: 'Motor', sortOrder: 4 },
    { type: 'insuranceCategory', value: 'Travel', label: 'Travel', sortOrder: 5 },
    { type: 'insuranceCategory', value: 'Commercial', label: 'Commercial', sortOrder: 6 },
    { type: 'insuranceCategory', value: 'Group Insurance', label: 'Group Insurance', sortOrder: 7 },

    // Lead Sources
    { type: 'leadSource', value: 'Website', label: 'Website', sortOrder: 1 },
    { type: 'leadSource', value: 'Instagram', label: 'Instagram', sortOrder: 2 },
    { type: 'leadSource', value: 'Facebook', label: 'Facebook', sortOrder: 3 },
    { type: 'leadSource', value: 'WhatsApp', label: 'WhatsApp', sortOrder: 4 },
    { type: 'leadSource', value: 'Referral', label: 'Referral', sortOrder: 5 },
    { type: 'leadSource', value: 'Walk In', label: 'Walk In', sortOrder: 6 },
    { type: 'leadSource', value: 'Existing Customer', label: 'Existing Customer', sortOrder: 7 },
    { type: 'leadSource', value: 'Employee Reference', label: 'Employee Reference', sortOrder: 8 },
    { type: 'leadSource', value: 'Other', label: 'Other', sortOrder: 9 },

    // Employment Types
    { type: 'employmentType', value: 'Salaried', label: 'Salaried', sortOrder: 1 },
    { type: 'employmentType', value: 'Self Employed', label: 'Self Employed', sortOrder: 2 },
    { type: 'employmentType', value: 'Business Owner', label: 'Business Owner', sortOrder: 3 },
    { type: 'employmentType', value: 'Professional', label: 'Professional', sortOrder: 4 },
    { type: 'employmentType', value: 'Retired', label: 'Retired', sortOrder: 5 },

    // Lead Statuses
    { type: 'leadStatus', value: 'New Lead', label: 'New Lead', sortOrder: 1 },
    { type: 'leadStatus', value: 'Contacted', label: 'Contacted', sortOrder: 2 },
    { type: 'leadStatus', value: 'Documents Pending', label: 'Documents Pending', sortOrder: 3 },
    { type: 'leadStatus', value: 'Under Process', label: 'Under Process', sortOrder: 4 },
    { type: 'leadStatus', value: 'Approved', label: 'Approved', sortOrder: 5 },
    { type: 'leadStatus', value: 'Disbursed', label: 'Disbursed', sortOrder: 6 },
    { type: 'leadStatus', value: 'Policy Issued', label: 'Policy Issued', sortOrder: 7 },
    { type: 'leadStatus', value: 'Rejected', label: 'Rejected', sortOrder: 8 },
    { type: 'leadStatus', value: 'Cancelled', label: 'Cancelled', sortOrder: 9 },
    { type: 'leadStatus', value: 'Not Interested', label: 'Not Interested', sortOrder: 10 },
    { type: 'leadStatus', value: 'Follow Up Required', label: 'Follow Up Required', sortOrder: 11 },

    // Rejection Reasons
    { type: 'rejectionReason', value: 'Low CIBIL', label: 'Low CIBIL', sortOrder: 1 },
    { type: 'rejectionReason', value: 'Income Criteria Not Met', label: 'Income Criteria Not Met', sortOrder: 2 },
    { type: 'rejectionReason', value: 'Age Criteria', label: 'Age Criteria', sortOrder: 3 },
    { type: 'rejectionReason', value: 'Employment Issue', label: 'Employment Issue', sortOrder: 4 },
    { type: 'rejectionReason', value: 'Existing Loan Burden', label: 'Existing Loan Burden', sortOrder: 5 },
    { type: 'rejectionReason', value: 'Insufficient Documents', label: 'Insufficient Documents', sortOrder: 6 },
    { type: 'rejectionReason', value: 'Policy Declined', label: 'Policy Declined', sortOrder: 7 },
    { type: 'rejectionReason', value: 'Medical Issue', label: 'Medical Issue', sortOrder: 8 },
    { type: 'rejectionReason', value: 'Customer Not Interested', label: 'Customer Not Interested', sortOrder: 9 },
    { type: 'rejectionReason', value: 'Duplicate Lead', label: 'Duplicate Lead', sortOrder: 10 },
    { type: 'rejectionReason', value: 'Other', label: 'Other', sortOrder: 11 },

    // Branches
    { type: 'branch', value: 'Head Office', label: 'Head Office', sortOrder: 1 },
    { type: 'branch', value: 'Mumbai', label: 'Mumbai', sortOrder: 2 },
    { type: 'branch', value: 'Delhi', label: 'Delhi', sortOrder: 3 },
    { type: 'branch', value: 'Bangalore', label: 'Bangalore', sortOrder: 4 },
    { type: 'branch', value: 'Pune', label: 'Pune', sortOrder: 5 },
    { type: 'branch', value: 'Hyderabad', label: 'Hyderabad', sortOrder: 6 },

    // Regions
    { type: 'region', value: 'North', label: 'North', sortOrder: 1 },
    { type: 'region', value: 'South', label: 'South', sortOrder: 2 },
    { type: 'region', value: 'East', label: 'East', sortOrder: 3 },
    { type: 'region', value: 'West', label: 'West', sortOrder: 4 },
    { type: 'region', value: 'Central', label: 'Central', sortOrder: 5 },
  ];

  for (const d of dropdowns) {
    await prisma.dropdownConfig.upsert({
      where: { type_value: { type: d.type, value: d.value } },
      update: {},
      create: d,
    });
  }

  // Seed sample leads
  const users = await prisma.user.findMany({ where: { role: 'ASSOCIATE' } });
  if (users.length > 0) {
    const sampleLeads = [
      { customerName: 'Amit Verma', mobile: '9876543210', productType: 'Personal Loan', leadSource: 'Website', leadStatus: 'New Lead', fileResult: 'Pending', city: 'Mumbai', state: 'Maharashtra' },
      { customerName: 'Sunita Patel', mobile: '9765432109', productType: 'Insurance', insuranceCategory: 'Health', leadSource: 'Instagram', leadStatus: 'Contacted', fileResult: 'Positive', approvalAmount: 500000, city: 'Pune', state: 'Maharashtra' },
      { customerName: 'Ravi Singh', mobile: '9654321098', productType: 'Home Loan', leadSource: 'Referral', leadStatus: 'Under Process', fileResult: 'Pending', city: 'Delhi', state: 'Delhi' },
      { customerName: 'Kavya Reddy', mobile: '9543210987', productType: 'Car Loan', leadSource: 'Facebook', leadStatus: 'Approved', fileResult: 'Positive', loanAmount: 800000, city: 'Hyderabad', state: 'Telangana' },
      { customerName: 'Mohit Gupta', mobile: '9432109876', productType: 'Business Loan', leadSource: 'Walk In', leadStatus: 'Rejected', fileResult: 'Negative', rejectionReason: 'Low CIBIL', city: 'Bangalore', state: 'Karnataka' },
      { customerName: 'Deepa Nair', mobile: '9321098765', productType: 'Insurance', insuranceCategory: 'Term', leadSource: 'WhatsApp', leadStatus: 'Policy Issued', fileResult: 'Positive', premiumAmount: 25000, city: 'Kochi', state: 'Kerala' },
      { customerName: 'Arjun Mehta', mobile: '9210987654', productType: 'Credit Card', leadSource: 'Employee Reference', leadStatus: 'Disbursed', fileResult: 'Positive', city: 'Ahmedabad', state: 'Gujarat' },
      { customerName: 'Pooja Joshi', mobile: '9109876543', productType: 'Mortgage Loan', leadSource: 'Existing Customer', leadStatus: 'Follow Up Required', fileResult: 'Pending', city: 'Jaipur', state: 'Rajasthan' },
    ];

    let leadCounter = 1;
    for (const lead of sampleLeads) {
      const dateStr = new Date().getFullYear().toString().slice(-2);
      const leadId = `WCF${dateStr}${String(leadCounter).padStart(4, '0')}`;
      const user = users[leadCounter % users.length];
      await prisma.lead.upsert({
        where: { leadId },
        update: {},
        create: {
          leadId,
          ...lead,
          employmentType: 'Salaried',
          branch: user.branch || 'Head Office',
          region: user.region || 'Central',
          assignedToId: user.id,
          createdById: user.id,
          lastUpdatedById: admin.id,
        },
      });
      leadCounter++;
    }
  }

  console.log('Seeding complete!');
  console.log('Login credentials:');
  console.log('  Admin:     admin@wecarefinserv.com / admin123');
  console.log('  Associate: rajesh@wecarefinserv.com / pass123');
  console.log('  Associate: priya@wecarefinserv.com / pass123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
