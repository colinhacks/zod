// This fixture tests @zod/mini's .d.cts types in a CommonJS context

import * as z from "@zod/mini";

const userSchema = z.object({
  name: z.string(),
  age: z.number().check(z.int(), z.positive()),
  tags: z.array(z.string()),
});

type User = z.infer<typeof userSchema>;

const result = z.safeParse(userSchema, { name: "Alice", age: 30, tags: [] });

if (result.success) {
  const user: User = result.data;
  console.log(user.name);
}

export { userSchema };
