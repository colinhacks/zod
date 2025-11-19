// Test: Zod Mini with large schema (+ English locale for fair comparison)
import * as z from "zod/mini";
import { en } from "zod/v4/locales";

// Configure English (same as V4 auto-does)
z.config(en());

// Large schema to exercise the library (using Mini's limited API)
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
});

const ProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  bio: z.string(),
  avatar: z.string(),
  birthDate: z.date(),
  address: AddressSchema,
});

const SettingsSchema = z.object({
  notifications: z.boolean(),
  theme: z.enum(["light", "dark", "auto"]),
  language: z.string(),
  timezone: z.string(),
});

const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  age: z.number(),
  role: z.enum(["admin", "user", "moderator"]),
  profile: ProfileSchema,
  settings: SettingsSchema,
  metadata: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CompanySchema = z.object({
  name: z.string(),
  employees: z.array(UserSchema),
  revenue: z.number(),
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
    bio: "Software developer",
    avatar: "https://example.com/avatar.jpg",
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
  metadata: { source: "signup", referrer: "google" },
  tags: ["developer", "typescript"],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const company = {
  name: "Acme Corp",
  employees: [user],
  revenue: 1000000,
  founded: new Date("2020-01-01"),
};

console.log(UserSchema.parse(user));
console.log(CompanySchema.parse(company));
