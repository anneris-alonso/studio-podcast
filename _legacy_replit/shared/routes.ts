import { z } from "zod";
import { 
  insertUserSchema, insertRoomSchema, insertBookingSchema, 
  insertPackageSchema, insertServiceSchema, users, studioRooms, 
  bookings, packages, services, plans, subscriptions, creditLedger, invoices, assets
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === Auth & Users ===
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/auth/login",
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    register: {
      method: "POST" as const,
      path: "/api/auth/register",
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/auth/me",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.null(),
      },
    },
  },

  // === Studio Rooms ===
  rooms: {
    list: {
      method: "GET" as const,
      path: "/api/rooms",
      responses: {
        200: z.array(z.custom<typeof studioRooms.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/rooms/:id",
      responses: {
        200: z.custom<typeof studioRooms.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/rooms",
      input: insertRoomSchema,
      responses: {
        201: z.custom<typeof studioRooms.$inferSelect>(),
      },
    },
  },

  // === Bookings ===
  bookings: {
    list: {
      method: "GET" as const,
      path: "/api/bookings",
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/bookings",
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/bookings/:id",
      input: insertBookingSchema.partial(),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === Services / Add-ons ===
  services: {
    list: {
      method: "GET" as const,
      path: "/api/services",
      responses: {
        200: z.array(z.custom<typeof services.$inferSelect>()),
      },
    },
  },

  // === Plans & Subscriptions ===
  plans: {
    list: {
      method: "GET" as const,
      path: "/api/plans",
      responses: {
        200: z.array(z.custom<typeof plans.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
