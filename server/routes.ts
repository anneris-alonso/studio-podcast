import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth"; // We'll create a simple auth helper or inline it if simple
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // === Seed Data ===
  await seedDatabase();

  // === Auth (Simple Session for Demo) ===
  // In a real app, use Passport or Replit Auth. For exact schema match, we use custom endpoints.
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) return res.status(400).json({ message: "Username taken" });
      const user = await storage.createUser(input);
      // Mock session login
      (req as any).session = { userId: user.id };
      res.status(201).json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    (req as any).session = { userId: user.id };
    res.json(user);
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) return res.sendStatus(401);
    const user = await storage.getUser(userId);
    res.json(user || null);
  });

  app.post("/api/auth/logout", (req, res) => {
    (req as any).session = null;
    res.sendStatus(200);
  });

  // === Rooms ===
  app.get(api.rooms.list.path, async (req, res) => {
    const rooms = await storage.getRooms();
    res.json(rooms);
  });

  app.get(api.rooms.get.path, async (req, res) => {
    const room = await storage.getRoom(Number(req.params.id));
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  });

  app.post(api.rooms.create.path, async (req, res) => {
    try {
      const input = api.rooms.create.input.parse(req.body);
      const room = await storage.createRoom(input);
      res.status(201).json(room);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === Bookings ===
  app.get(api.bookings.list.path, async (req, res) => {
    const bookings = await storage.getBookings();
    res.json(bookings);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch (e) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  // === Services & Plans ===
  app.get(api.services.list.path, async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.get(api.plans.list.path, async (req, res) => {
    const plans = await storage.getPlans();
    res.json(plans);
  });

  return httpServer;
}

async function seedDatabase() {
  const rooms = await storage.getRooms();
  if (rooms.length === 0) {
    console.log("Seeding database...");
    
    await storage.createRoom({
      name: "Neon Podcast Studio",
      description: "Soundproof 4-person podcast room with Shure SM7Bs and Rodecaster Pro.",
      capacity: 4,
      hourlyRate: "50.00",
      type: "podcast",
      imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1000",
    });

    await storage.createRoom({
      name: "Cyclorama Photo Stage",
      description: "Infinite white wall with Profoto lighting grid and dressing room.",
      capacity: 10,
      hourlyRate: "75.00",
      type: "photography",
      imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000",
    });

    await storage.createRoom({
      name: "Vocal Booth A",
      description: "Iso booth for voiceover and vocals. Neumann U87 included.",
      capacity: 1,
      hourlyRate: "30.00",
      type: "recording",
      imageUrl: "https://images.unsplash.com/photo-1519683109079-d5f539e1542f?auto=format&fit=crop&q=80&w=1000",
    });

    await storage.createPlan({
      name: "Creator",
      monthlyPrice: "29.00",
      includedCredits: 100,
      description: "Perfect for hobbyists",
    });

    await storage.createPlan({
      name: "Professional",
      monthlyPrice: "99.00",
      includedCredits: 500,
      description: "For working pros",
    });

    await storage.createService({
      name: "Audio Engineer",
      price: "40.00",
      durationMin: 60,
      description: "Professional tracking engineer",
      active: true,
    });
    
    console.log("Database seeded successfully.");
  }
}
