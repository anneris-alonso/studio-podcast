import { PrismaClient, UserRole, SubscriptionStatus, TransactionType, InvoiceStatus, AssetType, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Users
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@podcaststudio.com" },
    update: {},
    create: {
      email: "superadmin@podcaststudio.com",
      name: "Super Admin",
      password: "securepassword", // In a real app, hash this
      role: UserRole.SUPER_ADMIN,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@podcaststudio.com" },
    update: {},
    create: {
      email: "admin@podcaststudio.com",
      name: "Admin User",
      password: "securepassword",
      role: UserRole.ADMIN,
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      name: "John Client",
      password: "securepassword",
      role: UserRole.CLIENT,
    },
  });

  // 2. Studio Rooms
  const roomA = await prisma.studioRoom.upsert({
    where: { slug: "studio-a" },
    update: {},
    create: {
      name: "Studio A - Pro Podcast",
      slug: "studio-a",
      description: "Professional podcasting environment with high-end microphones.",
      capacity: 4,
      hourlyRate: 75.0,
      type: "podcast",
    },
  });

  const roomB = await prisma.studioRoom.studioRoom.upsert({
    where: { slug: "studio-b" },
    update: {},
    create: {
      name: "Studio B - Video Podcast",
      slug: "studio-b",
      description: "Equipped with 4K cameras and professional lighting.",
      capacity: 6,
      hourlyRate: 120.0,
      type: "recording",
    },
  });

  // 3. Packages
  await prisma.package.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Starter Bundle",
      price: 200.0,
      credits: 5,
      validityDays: 30,
      studioRoomId: roomA.id,
    },
  });

  await prisma.package.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Pro Bundle",
      price: 500.0,
      credits: 15,
      validityDays: 90,
      studioRoomId: roomA.id,
    },
  });

  await prisma.package.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "Premium Video Bundle",
      price: 1000.0,
      credits: 10,
      validityDays: 60,
      studioRoomId: roomB.id,
    },
  });

  // 4. Services (Add-ons)
  const servicesData = [
    { id: 1, name: "Additional Microphone", price: 10.0, durationMin: 0 },
    { id: 2, name: "Video Recording (Raw)", price: 30.0, durationMin: 0 },
    { id: 3, name: "Basic Editing (1hr)", price: 50.0, durationMin: 60 },
    { id: 4, name: "Pro Editing (1hr)", price: 100.0, durationMin: 60 },
    { id: 5, name: "Live Streaming Setup", price: 40.0, durationMin: 30 },
    { id: 6, name: "Guest Remote Connection", price: 15.0, durationMin: 0 },
    { id: 7, name: "Social Media Clips (3x)", price: 45.0, durationMin: 0 },
    { id: 8, name: "Teleprompter Usage", price: 20.0, durationMin: 0 },
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }

  // 5. Plans
  await prisma.plan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Basic Creator",
      monthlyPrice: 150.0,
      includedCredits: 4,
      description: "Perfect for monthly hobbyist podcasters.",
    },
  });

  await prisma.plan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Professional Podcaster",
      monthlyPrice: 400.0,
      includedCredits: 12,
      description: "For weekly professional shows.",
    },
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
