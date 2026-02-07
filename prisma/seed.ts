// Production-grade database seeder for BookYourService
// Populates all 27 service categories with subcategories

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// SERVICE CATEGORIES & SUBCATEGORIES
// ============================================

const categories = [
  // I. Home Maintenance & Repairs
  {
    name: 'Home Maintenance & Repairs',
    slug: 'home-maintenance-repairs',
    description: 'Essential home repair and maintenance services',
    icon: '🔧',
    order: 1,
    subcategories: [
      'Plumbing',
      'Electrical',
      'AC & HVAC Services',
      'Carpentry & Woodwork',
      'Painting & Decoration',
      'Handyman Services',
      'Masonry & Tiling',
      'Pest Control',
      'Home Cleaning',
      'Water Tank Cleaning',
    ]
  },
  
  // II. Appliances & Electronics
  {
    name: 'Appliances & Electronics',
    slug: 'appliances-electronics',
    description: 'Repair and maintenance for home appliances and electronics',
    icon: '🔌',
    order: 2,
    subcategories: [
      'Appliance Repair',
      'Gadget Repair',
    ]
  },
  
  // III. Outdoor & Property
  {
    name: 'Outdoor & Property',
    slug: 'outdoor-property',
    description: 'Outdoor services and property maintenance',
    icon: '🌳',
    order: 3,
    subcategories: [
      'Lawn & Gardening',
      'Cleaning - Exterior',
      'Moving & Relocation',
    ]
  },
  
  // IV. Beauty & Wellness (At-Home)
  {
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    description: 'Personal care and wellness services',
    icon: '💆',
    order: 4,
    subcategories: [
      'Salon for Women',
      'Barber/Grooming for Men',
      'Massage & Body Spa',
      'Fitness Training',
      'Yoga & Meditation',
    ]
  },
  
  // V. Professional & Lifestyle Services
  {
    name: 'Professional & Lifestyle',
    slug: 'professional-lifestyle',
    description: 'Professional services and lifestyle assistance',
    icon: '🎯',
    order: 5,
    subcategories: [
      'Home Tutoring',
      'Event Planning & Management',
      'Photography & Video',
      'Tailoring & Alteration',
      'Pet Care',
      'Car Care & Detailing',
      'Virtual Assistance/Tech Support',
    ]
  },
];

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.service.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared\n');

    // Create categories and subcategories
    console.log('📦 Creating categories and subcategories...\n');
    
    for (const cat of categories) {
      console.log(`Creating category: ${cat.name}`);
      
      const category = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          isActive: true,
          order: cat.order,
        },
      });

      console.log(`  ✅ Category created: ${cat.name}`);
      
      // Create subcategories
      for (let i = 0; i < cat.subcategories.length; i++) {
        const subName = cat.subcategories[i];
        const slug = subName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        await prisma.subCategory.create({
          data: {
            categoryId: category.id,
            name: subName,
            slug: slug,
            isActive: true,
            order: i,
          },
        });
        
        console.log(`    ✅ Subcategory created: ${subName}`);
      }
      
      console.log('');
    }

    console.log(`\n✅ Created ${categories.length} categories`);
    console.log(`✅ Created ${categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)} subcategories\n`);

    // Create sample admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await hashPassword('Admin@123');
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@bookyourservice.com',
        passwordHash: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        trustScore: 5.0,
      },
    });
    
    console.log('✅ Admin user created\n');
    console.log('📧 Admin Login Credentials:');
    console.log('   Email: admin@bookyourservice.com');
    console.log('   Password: Admin@123\n');

    // Create sample provider
    console.log('👷 Creating sample provider...');
    const providerPassword = await hashPassword('Provider@123');
    
    const provider = await prisma.user.create({
      data: {
        email: 'provider@bookyourservice.com',
        passwordHash: providerPassword,
        name: 'Expert Services',
        phone: '9876543210',
        role: 'PROVIDER',
        status: 'ACTIVE',
        emailVerified: true,
        trustScore: 5.0,
        businessName: 'Expert Services Ltd.',
        description: 'Professional service provider with 10+ years of experience',
        experienceYears: 10,
        city: 'Mumbai',
      },
    });
    
    console.log('✅ Sample provider created\n');
    console.log('📧 Provider Login Credentials:');
    console.log('   Email: provider@bookyourservice.com');
    console.log('   Password: Provider@123\n');

    // Create sample services
    console.log('🛠️  Creating sample services...\n');
    
    const sampleServices = [
      {
        title: 'AC Repair & Service',
        description: 'Professional AC repair, installation, and servicing. All brands supported with genuine parts.',
        basePrice: 499,
        durationMinutes: 60,
        categoryId: 0,
        subIndex: 2,
      },
      {
        title: 'Home Cleaning Service',
        description: 'Complete home cleaning including kitchen, bathroom, living room, and bedrooms. Eco-friendly products used.',
        basePrice: 999,
        durationMinutes: 120,
        categoryId: 0,
        subIndex: 8,
      },
      {
        title: 'Plumbing Repair',
        description: 'Expert plumbing services including leak repair, drain cleaning, pipe installation, and fixture repair.',
        basePrice: 399,
        durationMinutes: 45,
        categoryId: 0,
        subIndex: 0,
      },
      {
        title: 'Electrical Work',
        description: 'Complete electrical services from wiring repairs to fixture installation and smart home setup.',
        basePrice: 599,
        durationMinutes: 60,
        categoryId: 0,
        subIndex: 1,
      },
      {
        title: 'Personal Fitness Training',
        description: 'One-on-one fitness training customized to your goals. Includes diet and workout plan.',
        basePrice: 1499,
        durationMinutes: 60,
        categoryId: 3,
        subIndex: 3,
      },
      {
        title: 'Yoga Classes',
        description: 'Professional yoga instruction for all levels. Hatha, Vinyasa, and meditation sessions available.',
        basePrice: 799,
        durationMinutes: 60,
        categoryId: 3,
        subIndex: 4,
      },
      {
        title: 'Laptop & Computer Repair',
        description: 'Expert repair services for laptops, computers, and peripherals. Hardware and software issues.',
        basePrice: 599,
        durationMinutes: 60,
        categoryId: 1,
        subIndex: 1,
      },
      {
        title: 'Lawn Mowing & Gardening',
        description: 'Complete garden maintenance including lawn mowing, hedging, pruning, and plant care.',
        basePrice: 899,
        durationMinutes: 90,
        categoryId: 2,
        subIndex: 0,
      },
      {
        title: 'Event Planning & Management',
        description: 'Professional event planning for birthdays, weddings, corporate events, and parties.',
        basePrice: 4999,
        durationMinutes: 120,
        categoryId: 4,
        subIndex: 1,
      },
      {
        title: 'Pet Grooming Services',
        description: 'Professional pet grooming for dogs and cats. Includes bathing, haircut, and nail trimming.',
        basePrice: 499,
        durationMinutes: 45,
        categoryId: 4,
        subIndex: 4,
      },
      {
        title: 'Car Washing & Detailing',
        description: 'Complete car care including exterior wash, interior detailing, waxing, and polishing.',
        basePrice: 999,
        durationMinutes: 90,
        categoryId: 4,
        subIndex: 5,
      },
    ];

    const createdCategories = await prisma.category.findMany();
    
    for (const serviceData of sampleServices) {
      const category = createdCategories[serviceData.categoryId];
      const subcategories = await prisma.subCategory.findMany({
        where: { categoryId: category.id },
      });
      const subCategory = subcategories[serviceData.subIndex];
      
      const slug = serviceData.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      await prisma.service.create({
        data: {
          providerId: provider.id,
          categoryId: category.id,
          subCategoryId: subCategory?.id,
          title: serviceData.title,
          slug: slug,
          description: serviceData.description,
          basePrice: serviceData.basePrice,
          durationMinutes: serviceData.durationMinutes,
          city: 'Mumbai',
          images: JSON.stringify(['https://via.placeholder.com/400x300']),
          status: 'ACTIVE',
          isAvailable: true,
          featured: Math.random() > 0.7, // 30% chance to be featured
          verified: true,
          providerName: provider.name,
          providerAvatar: provider.avatar,
          providerRating: provider.trustScore,
        },
      });
      
      console.log(`  ✅ Service created: ${serviceData.title}`);
    }

    console.log(`\n✅ Created ${sampleServices.length} sample services\n`);

    // Create sample client
    console.log('👤 Creating sample client...');
    const clientPassword = await hashPassword('Client@123');
    
    const client = await prisma.user.create({
      data: {
        email: 'client@bookyourservice.com',
        passwordHash: clientPassword,
        name: 'John Doe',
        phone: '9876543211',
        role: 'CLIENT',
        status: 'ACTIVE',
        emailVerified: true,
        trustScore: 5.0,
        city: 'Mumbai',
        address: '123 Main Street',
      },
    });
    
    console.log('✅ Sample client created\n');
    console.log('📧 Client Login Credentials:');
    console.log('   Email: client@bookyourservice.com');
    console.log('   Password: Client@123\n');

    console.log('========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('========================================\n');
    
    console.log('📊 SEEDING SUMMARY:');
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Subcategories: ${categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}`);
    console.log(`   Users: 3 (Admin, Provider, Client)`);
    console.log(`   Services: ${sampleServices.length}`);
    console.log('\n🔑 Login Credentials for Testing:');
    console.log('\n   👑 ADMIN:');
    console.log('      Email: admin@bookyourservice.com');
    console.log('      Password: Admin@123');
    console.log('\n   👑 PROVIDER:');
    console.log('      Email: provider@bookyourservice.com');
    console.log('      Password: Provider@123');
    console.log('\n   👑 CLIENT:');
    console.log('      Email: client@bookyourservice.com');
    console.log('      Password: Client@123');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Simple hash function (matching the crypto.ts implementation)
import { createHash, randomBytes } from 'crypto';

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
