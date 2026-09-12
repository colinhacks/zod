// This fixture tests that @zod/mini's built types resolve onto the peer's
// declarations with no internal errors when compiled with skipLibCheck: false

import * as z from "@zod/mini";
import type * as zm from "zod/mini";

const userSchema = z.object({
  name: z.string(),
  age: z.number().check(z.int(), z.positive()),
  tags: z.array(z.string()),
  role: z.enum(["admin", "user", "guest"]),
  metadata: z.record(z.string(), z.unknown()),
});

type User = z.infer<typeof userSchema>;

const result = z.safeParse(userSchema, {
  name: "Alice",
  age: 30,
  tags: ["developer"],
  role: "admin",
  metadata: { foo: "bar" },
});

if (result.success) {
  const user: User = result.data;
  console.log(user.name);
}

// the scoped package and the subpath are one declaration tree
const _sameTree: zm.ZodMiniObject = userSchema;

export { userSchema };
