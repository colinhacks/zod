// Test: Zod v4 with large schema (English locale auto-configured)
import * as z from "zod/v4";

// Large schema to exercise the library
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().min(5).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(["admin", "user", "moderator"]),
  profile: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
    birthDate: z.date(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string().length(2),
      zip: z.string().regex(/^\d{5}(-\d{4})?$/),
      country: z.string().default("US"),
    }).optional(),
  }),
  settings: z.object({
    notifications: z.boolean().default(true),
    theme: z.enum(["light", "dark", "auto"]).default("auto"),
    language: z.string().default("en"),
    timezone: z.string(),
  }),
  metadata: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).min(0).max(10),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CompanySchema = z.object({
  name: z.string().min(1).max(100),
  employees: z.array(UserSchema).min(1).max(1000),
  revenue: z.number().positive(),
  founded: z.date(),
});

// Use the schemas
const user = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  username: "testuser",
  age: 25,
  role: "user" as const,
  profile: {
    firstName: "John",
    lastName: "Doe",
    birthDate: new Date("1999-01-01"),
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      country: "US",
    },
  },
  settings: {
    notifications: true,
    theme: "dark" as const,
    language: "en",
    timezone: "America/Los_Angeles",
  },
  tags: ["developer", "typescript"],
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log(UserSchema.parse(user));
