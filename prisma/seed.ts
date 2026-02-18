import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Studio Rooms
  const podcastStudio = await prisma.studioRoom.upsert({
    where: { slug: 'podcast-studio-a' },
    update: {},
    create: {
      name: 'Podcast Studio A',
      slug: 'podcast-studio-a',
      description: 'Professional podcast recording studio with soundproofing and premium equipment',
      capacity: 4,
      hourlyRate: 250,
      type: 'podcast',
      imageUrl: '/images/studios/podcast-a.jpg',
    },
  });

  const recordingStudio = await prisma.studioRoom.upsert({
    where: { slug: 'recording-studio-pro' },
    update: {},
    create: {
      name: 'Recording Studio Pro',
      slug: 'recording-studio-pro',
      description: 'State-of-the-art recording studio for music production',
      capacity: 6,
      hourlyRate: 350,
      type: 'recording',
      imageUrl: '/images/studios/recording-pro.jpg',
    },
  });

  console.log('✅ Created studio rooms');

  // Create Packages
  await prisma.package.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Basic Session',
      slug: 'basic-session',
      description: 'Standard 1-hour recording session',
      price: 200,
      credits: 60,
      durationMinutes: 60,
      validityDays: 30,
      active: true,
      studioRoomId: podcastStudio.id,
    },
  });

  await prisma.package.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Extended Session',
      slug: 'extended-session',
      description: 'Extended 2-hour recording & strategy session',
      price: 350,
      credits: 120,
      durationMinutes: 120,
      validityDays: 30,
      active: true,
      studioRoomId: podcastStudio.id,
    },
  });

  console.log('✅ Created packages');

  // Create Services
  await prisma.service.upsert({
    where: { slug: 'audio-mixing' },
    update: {},
    create: {
      name: 'Audio Mixing',
      slug: 'audio-mixing',
      description: 'Professional audio mixing and mastering',
      price: 150, // Legacy decimal, Prisma handles int/float conversion usually, or use Decimal
      durationMin: 60,
      active: true,
      category: 'EDITING',
      unit: 'PER_BOOKING',
      priceMinor: 15000,
    },
  });

  await prisma.service.upsert({
    where: { slug: 'video-recording' },
    update: {},
    create: {
      name: 'Video Recording',
      slug: 'video-recording',
      description: 'Multi-camera video recording setup',
      price: 200,
      active: true,
      category: 'RECORDING',
      unit: 'PER_BOOKING',
      priceMinor: 20000,
    },
  });

  console.log('✅ Created services');

  // Create Subscription Plans
  const creatorPlan = await prisma.plan.upsert({
    where: { slug: 'creator' },
    update: {},
    create: {
      name: 'Creator Plan',
      slug: 'creator',
      monthlyPrice: 99900, // 999.00 AED in minor units
      includedCredits: 10, // 10 hours per month
      description: 'Perfect for content creators and podcasters starting out',
      isActive: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Pro Plan',
      slug: 'pro',
      monthlyPrice: 199900, // 1999.00 AED in minor units
      includedCredits: 25, // 25 hours per month
      description: 'For professional creators who need more studio time',
      isActive: true,
    },
  });

  const businessPlan = await prisma.plan.upsert({
    where: { slug: 'business' },
    update: {},
    create: {
      name: 'Business Plan',
      slug: 'business',
      monthlyPrice: 399900, // 3999.00 AED in minor units
      includedCredits: 60, // 60 hours per month
      description: 'Unlimited access for businesses and production companies',
      isActive: true,
    },
  });

  console.log('✅ Created subscription plans');
  console.log(`   - ${creatorPlan.name}: ${creatorPlan.includedCredits}h/month`);
  console.log(`   - ${proPlan.name}: ${proPlan.includedCredits}h/month`);
  console.log(`   - ${businessPlan.name}: ${businessPlan.includedCredits}h/month`);

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@studio.com' },
    update: {},
    create: {
      email: 'test@studio.com',
      name: 'Test User',
      passwordHash,
      role: 'CLIENT',
    },
  });

  // Create Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@studio.com' },
    update: {},
    create: {
      email: 'admin@studio.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Create Super Admin user
  const superUser = await prisma.user.upsert({
    where: { email: 'super@studio.com' },
    update: {},
    create: {
      email: 'super@studio.com',
      name: 'Super Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Created users');
  console.log(`   - Client: ${testUser.email}`);
  console.log(`   - Admin: ${adminUser.email}`);
  console.log(`   - Super Admin: ${superUser.email}`);

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
