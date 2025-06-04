import { z } from "zod";

// (A) fails in v4 – TDZ on recursive use
const NodeA: z.ZodType<any> = z.lazy(() => NodeA).optional();

// (B) works in v4
const NodeB: z.ZodType<any> = z.lazy(() => NodeB.optional());

// Usage
NodeA.parse(undefined); // ❌ ReferenceError: Cannot access 'NodeA' before initialization
NodeB.parse(undefined); // ✅ passes
