import { 
  users, studioRooms, bookings, services, plans, packages,
  type User, type InsertUser, type StudioRoom, type InsertRoom,
  type Booking, type InsertBooking, type Service, type Plan, type Package
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Rooms
  getRooms(): Promise<StudioRoom[]>;
  getRoom(id: number): Promise<StudioRoom | undefined>;
  createRoom(room: InsertRoom): Promise<StudioRoom>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;

  // Services & Plans (Read-only for now in seed)
  getServices(): Promise<Service[]>;
  createService(service: Omit<Service, "id">): Promise<Service>;
  getPlans(): Promise<Plan[]>;
  createPlan(plan: Omit<Plan, "id">): Promise<Plan>;
  getPackages(): Promise<Package[]>;
  createPackage(pkg: Omit<Package, "id">): Promise<Package>;
}

export class DatabaseStorage implements IStorage {
  // === Users ===
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // === Rooms ===
  async getRooms(): Promise<StudioRoom[]> {
    return await db.select().from(studioRooms);
  }

  async getRoom(id: number): Promise<StudioRoom | undefined> {
    const [room] = await db.select().from(studioRooms).where(eq(studioRooms.id, id));
    return room;
  }

  async createRoom(room: InsertRoom): Promise<StudioRoom> {
    const [newRoom] = await db.insert(studioRooms).values(room).returning();
    return newRoom;
  }

  // === Bookings ===
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updated] = await db.update(bookings).set(booking).where(eq(bookings.id, id)).returning();
    return updated;
  }

  // === Services, Plans, Packages ===
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createService(service: Omit<Service, "id">): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async getPlans(): Promise<Plan[]> {
    return await db.select().from(plans);
  }

  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    const [newPlan] = await db.insert(plans).values(plan).returning();
    return newPlan;
  }

  async getPackages(): Promise<Package[]> {
    return await db.select().from(packages);
  }

  async createPackage(pkg: Omit<Package, "id">): Promise<Package> {
    const [newPkg] = await db.insert(packages).values(pkg).returning();
    return newPkg;
  }
}

export const storage = new DatabaseStorage();
