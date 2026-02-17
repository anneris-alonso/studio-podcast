import prisma from "@/lib/db";

/**
 * listStudioRooms()
 * Retrieves all studio rooms from the database.
 */
export async function listStudioRooms() {
  return prisma.studioRoom.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * getStudioRoomBySlug(slug)
 * Retrieves a single studio room by its unique slug.
 */
export async function getStudioRoomBySlug(slug: string) {
  return prisma.studioRoom.findUnique({
    where: { slug },
  });
}

/**
 * listPackagesByStudioRoom(studioRoomId)
 * Retrieves all packages associated with a specific studio room.
 */
export async function listPackagesByStudioRoom(studioRoomId: number) {
  return prisma.package.findMany({
    where: {
      studioRoomId,
      active: true,
    },
    orderBy: { price: "asc" },
  });
}

/**
 * listActiveServices()
 * Retrieves all active services (add-ons).
 */
export async function listActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

/**
 * getUserByEmail(email)
 * Retrieves a user by their unique email address.
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
