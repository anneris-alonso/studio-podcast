import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === Users ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'admin' | 'user'
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === Studio Rooms ===
export const studioRooms = pgTable("studio_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  capacity: integer("capacity").notNull(),
  hourlyRate: decimal("hourly_rate").notNull(),
  imageUrl: text("image_url"),
  type: text("type").notNull(), // 'recording', 'podcast', 'photography'
  createdAt: timestamp("created_at").defaultNow(),
});

// === Packages (Credit Bundles) ===
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price").notNull(),
  credits: integer("credits").notNull(),
  validityDays: integer("validity_days").notNull(),
  active: boolean("active").default(true),
});

// === Services (Add-ons) ===
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  durationMin: integer("duration_min").default(0),
  active: boolean("active").default(true),
});

// === Plans (Subscriptions) ===
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  monthlyPrice: decimal("monthly_price").notNull(),
  includedCredits: integer("included_credits").notNull(),
  description: text("description"),
});

// === Subscriptions ===
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planId: integer("plan_id").notNull(),
  status: text("status").notNull(), // 'active', 'cancelled', 'past_due'
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === Credit Ledger ===
export const creditLedger = pgTable("credit_ledger", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // Positive for credit, negative for debit
  transactionType: text("transaction_type").notNull(), // 'purchase', 'booking', 'adjustment', 'subscription'
  referenceId: text("reference_id"), // ID of related booking/invoice
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === Bookings ===
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roomId: integer("room_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'cancelled', 'completed'
  totalPrice: decimal("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === Booking Line Items ===
export const bookingLineItems = pgTable("booking_line_items", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  serviceId: integer("service_id").notNull(),
  priceAtBooking: decimal("price_at_booking").notNull(),
  quantity: integer("quantity").default(1),
});

// === Invoices ===
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bookingId: integer("booking_id"),
  subscriptionId: integer("subscription_id"),
  amount: decimal("amount").notNull(),
  status: text("status").notNull(), // 'paid', 'unpaid', 'void'
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === Assets ===
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'image', 'document', 'floorplan'
  url: text("url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// === RELATIONS ===
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  subscriptions: many(subscriptions),
  ledgerEntries: many(creditLedger),
  invoices: many(invoices),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  room: one(studioRooms, { fields: [bookings.roomId], references: [studioRooms.id] }),
  lineItems: many(bookingLineItems),
  invoice: one(invoices, { fields: [bookings.id], references: [invoices.bookingId] }),
}));

export const bookingLineItemsRelations = relations(bookingLineItems, ({ one }) => ({
  booking: one(bookings, { fields: [bookingLineItems.bookingId], references: [bookings.id] }),
  service: one(services, { fields: [bookingLineItems.serviceId], references: [services.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));

// === ZOD SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(studioRooms).omit({ id: true, createdAt: true });
export const insertPackageSchema = createInsertSchema(packages).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });
export const insertLedgerSchema = createInsertSchema(creditLedger).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertLineItemSchema = createInsertSchema(bookingLineItems).omit({ id: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, uploadedAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type StudioRoom = typeof studioRooms.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type CreditLedger = typeof creditLedger.$inferSelect;
