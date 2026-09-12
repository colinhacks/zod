/**
 * Whole-application memory: how much heap does a realistically-sized schema
 * catalogue cost? This is the number a service actually pays — a few hundred
 * schemas held for the process lifetime, each with nested objects, unions,
 * arrays and refinements.
 */
import * as z from "zod";
import { collect, fmtBytes, table } from "./harness.js";

/** One "resource" the way an API codebase tends to define them. */
function makeResource(i: number) {
  const Address = z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1),
    postalCode: z.string().regex(/^\d{5}$/),
    country: z.string().length(2),
  });

  const Contact = z.object({
    email: z.email(),
    phone: z.string().optional(),
    address: Address.optional(),
  });

  const Status = z.enum(["active", "pending", "archived", "deleted"]);

  const Event = z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("created"), at: z.iso.datetime(), by: z.uuid() }),
    z.object({ kind: z.literal("updated"), at: z.iso.datetime(), fields: z.array(z.string()) }),
    z.object({ kind: z.literal("deleted"), at: z.iso.datetime(), reason: z.string().nullable() }),
  ]);

  return z
    .object({
      id: z.uuid(),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      title: z.string().min(1).max(300),
      description: z.string().max(5000).optional(),
      status: Status,
      count: z.number().int().nonnegative(),
      score: z.number().min(0).max(100),
      tags: z.array(z.string().min(1)).max(50),
      contact: Contact,
      history: z.array(Event),
      metadata: z.record(z.string(), z.unknown()).optional(),
      createdAt: z.iso.datetime(),
      updatedAt: z.iso.datetime().nullable(),
    })
    .refine((v) => v.createdAt <= (v.updatedAt ?? v.createdAt), `resource ${i}: updatedAt precedes createdAt`);
}

const COUNTS = [50, 200, 500];

const rows = COUNTS.map((n) => {
  // Warm the lazily-installed prototypes so they aren't billed to the payload.
  makeResource(-1);
  collect();
  const before = process.memoryUsage().heapUsed;

  const catalogue: unknown[] = [];
  for (let i = 0; i < n; i++) catalogue.push(makeResource(i));

  collect();
  const after = process.memoryUsage().heapUsed;
  if (catalogue.length !== n) throw new Error("unreachable");

  return {
    "resource schemas": n,
    "heap held": fmtBytes(after - before),
    "per resource": fmtBytes((after - before) / n),
    bytes: (after - before).toFixed(0),
  };
});

console.log("realistic schema catalogue (each resource is ~40 schema nodes)\n");
table(rows);
