import { z } from "zod/v4";

z;

function foo<T extends z.ZodObject<Record<string, z.ZodType<string>>>>(
  schema: z.ZodObject<Record<string, z.ZodType<string>>>,
  data: z.output<typeof schema>
) {
  // ❌ Record<string, unknown> is not assignable to Record<string, string>

  data;
  const data2: Record<string, string> = data;
}
