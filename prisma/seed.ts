import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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
  await prisma.service.create({
    data: {
      name: 'Audio Mixing',
      description: 'Professional audio mixing and mastering',
      price: 150,
      durationMin: 60,
      active: true,
    },
  });

  await prisma.service.create({
    data: {
      name: 'Video Recording',
      description: 'Multi-camera video recording setup',
      price: 200,
      durationMin: 0,
      active: true,
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
      password: '$2a$10$YourHashedPasswordHere', // In production, use bcrypt
      role: 'CLIENT',
    },
  });

  console.log('✅ Created test user');
  console.log(`   - Email: ${testUser.email}`);

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
