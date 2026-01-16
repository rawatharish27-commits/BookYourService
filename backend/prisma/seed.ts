import { PrismaClient, UserRole, UserStatus, VerificationStatus, SLATier } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // --- USER SEEDING ---

  // 1. Create/Update Super Admin
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bookyourservice.co.in' },
    update: {
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.ADMIN_APPROVED,
    },
    create: {
      id: uuidv4(),
      phone: '9999999999',
      email: 'admin@bookyourservice.co.in',
      name: 'Super Admin',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      adminRole: 'SUPER_ADMIN',
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.ADMIN_APPROVED,
      city: 'MUMBAI',
    }
  });
  console.log('✅ Admin user seeded:', admin.email);

  // 2. Create a Verified Customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@bookyourservice.co.in' },
    update: {},
    create: {
      id: uuidv4(),
      phone: '8888888888',
      email: 'customer@bookyourservice.co.in',
      name: 'Verified Customer',
      passwordHash: customerPassword,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.ACTIVE,
      city: 'MUMBAI',
    }
  });
  console.log('✅ Customer user seeded:', customer.email);

  // 3. Create an Approved Provider
  const providerPassword = await bcrypt.hash('provider123', 10);
  const approvedProvider = await prisma.user.upsert({
    where: { email: 'provider.approved@bookyourservice.co.in' },
    update: {},
    create: {
      id: uuidv4(),
      phone: '7777777777',
      email: 'provider.approved@bookyourservice.co.in',
      name: 'Approved Provider',
      passwordHash: providerPassword,
      role: UserRole.PROVIDER,
      status: UserStatus.ACTIVE,
      verificationStatus: VerificationStatus.ADMIN_APPROVED,
      city: 'PUNE',
    }
  });
  console.log('✅ Approved Provider user seeded:', approvedProvider.email);

  // 4. Create a Pending Provider
  const pendingProvider = await prisma.user.upsert({
    where: { email: 'provider.pending@bookyourservice.co.in' },
    update: {},
    create: {
      id: uuidv4(),
      phone: '6666666666',
      email: 'provider.pending@bookyourservice.co.in',
      name: 'Pending Provider',
      passwordHash: providerPassword, // can use same password for testing
      role: UserRole.PROVIDER,
      status: UserStatus.PENDING,
      verificationStatus: VerificationStatus.KYC_PENDING,
      city: 'DELHI',
    }
  });
  console.log('✅ Pending Provider user seeded:', pendingProvider.email);


  // --- OTHER SEEDING (Categories, Problems, Config) ---

  // Create categories
  const categories = [
    { name: 'Home Cleaning', icon: '🧹', providerType: 'CLEANING' },
    { name: 'Plumbing', icon: '🔧', providerType: 'PLUMBING' },
    { name: 'Electrical', icon: '⚡', providerType: 'ELECTRICAL' },
    { name: 'AC Repair', icon: '❄️', providerType: 'AC_REPAIR' },
    { name: 'Appliance Repair', icon: '🔌', providerType: 'APPLIANCE' },
    { name: 'Painting', icon: '🎨', providerType: 'PAINTING' },
    { name: 'Pest Control', icon: '🐛', providerType: 'PEST_CONTROL' },
    { name: 'Gardening', icon: '🌱', providerType: 'GARDENING' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        id: uuidv4(),
        ...cat,
        isEnabled: true,
      }
    });
  }
  console.log('✅ Categories seeded');

  // Create problems/services
  const problems = [
    // Cleaning
    { ontologyId: 'CLEAN-001', category: 'Home Cleaning', subCategory: 'Deep Cleaning', title: 'Full Home Deep Cleaning', basePrice: 2999, maxPrice: 4999, description: 'Complete deep cleaning of all rooms', providerRole: 'CLEANING', severity: 5, slaTier: SLATier.SILVER },
    { ontologyId: 'CLEAN-002', category: 'Home Cleaning', subCategory: 'Sofa Cleaning', title: 'Sofa Cleaning (3 Seater)', basePrice: 799, maxPrice: 1299, description: 'Professional sofa cleaning', providerRole: 'CLEANING', severity: 3, slaTier: SLATier.GOLD },
    { ontologyId: 'CLEAN-003', category: 'Home Cleaning', subCategory: 'Kitchen Cleaning', title: 'Modular Kitchen Cleaning', basePrice: 1499, maxPrice: 2499, description: 'Deep cleaning of modular kitchen', providerRole: 'CLEANING', severity: 4, slaTier: SLATier.SILVER },
    
    // Plumbing
    { ontologyId: 'PLUMB-001', category: 'Plumbing', subCategory: 'Leakage', title: 'Pipe Leakage Repair', basePrice: 299, maxPrice: 799, description: 'Fix pipe leakages', providerRole: 'PLUMBING', severity: 5, slaTier: SLATier.GOLD },
    { ontologyId: 'PLUMB-002', category: 'Plumbing', subCategory: 'Installation', title: 'Tap Installation', basePrice: 399, maxPrice: 999, description: 'Install new tap fixture', providerRole: 'PLUMBING', severity: 2, slaTier: SLATier.BRONZE },
    { ontologyId: 'PLUMB-003', category: 'Plumbing', subCategory: 'Blockage', title: 'Drain Cleaning', basePrice: 499, maxPrice: 1499, description: 'Unblock clogged drain', providerRole: 'PLUMBING', severity: 4, slaTier: SLATier.SILVER },
    
    // Electrical
    { ontologyId: 'ELEC-001', category: 'Electrical', subCategory: 'Fan', title: 'Fan Installation/Repair', basePrice: 299, maxPrice: 699, description: 'Install or repair ceiling fan', providerRole: 'ELECTRICAL', severity: 3, slaTier: SLATier.BRONZE },
    { ontologyId: 'ELEC-002', category: 'Electrical', subCategory: 'Wiring', title: 'Electrical Wiring Repair', basePrice: 599, maxPrice: 1999, description: 'Fix faulty electrical wiring', providerRole: 'ELECTRICAL', severity: 5, slaTier: SLATier.GOLD },
    { ontologyId: 'ELEC-003', category: 'Electrical', subCategory: 'MCB', title: 'MCB Box Installation', basePrice: 899, maxPrice: 2499, description: 'Install new MCB distribution board', providerRole: 'ELECTRICAL', severity: 4, slaTier: SLATier.SILVER },
    
    // AC Repair
    { ontologyId: 'AC-001', category: 'AC Repair', subCategory: 'Gas Refill', title: 'AC Gas Refill', basePrice: 1499, maxPrice: 3499, description: 'Refill AC refrigerant gas', providerRole: 'AC_REPAIR', severity: 4, slaTier: SLATier.GOLD },
    { ontologyId: 'AC-002', category: 'AC Repair', subCategory: 'Service', title: 'AC Regular Service', basePrice: 799, maxPrice: 1499, description: 'Complete AC servicing', providerRole: 'AC_REPAIR', severity: 3, slaTier: SLATier.SILVER },
    { ontologyId: 'AC-003', category: 'AC Repair', subCategory: 'Repair', title: 'AC Repair (Minor)', basePrice: 499, maxPrice: 1499, description: 'Fix minor AC issues', providerRole: 'AC_REPAIR', severity: 4, slaTier: SLATier.SILVER },
    
    // Appliance Repair
    { ontologyId: 'APP-001', category: 'Appliance Repair', subCategory: 'Washing Machine', title: 'Washing Machine Repair', basePrice: 499, maxPrice: 1999, description: 'Repair washing machine issues', providerRole: 'APPLIANCE', severity: 4, slaTier: SLATier.SILVER },
    { ontologyId: 'APP-002', category: 'Appliance Repair', subCategory: 'Microwave', title: 'Microwave Repair', basePrice: 399, maxPrice: 1499, description: 'Repair microwave issues', providerRole: 'APPLIANCE', severity: 3, slaTier: SLATier.BRONZE },
    { ontologyId: 'APP-003', category: 'Appliance Repair', subCategory: 'Refrigerator', title: 'Refrigerator Repair', basePrice: 599, maxPrice: 2499, description: 'Repair refrigerator issues', providerRole: 'APPLIANCE', severity: 5, slaTier: SLATier.GOLD }
  ];

  for (const problem of problems) {
    await prisma.problem.upsert({
      where: { ontologyId: problem.ontologyId },
      update: {},
      create: {
        id: uuidv4(),
        ...problem
      }
    });
  }
  console.log('✅ Problems seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });