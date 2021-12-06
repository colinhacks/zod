import { ZodType } from "../types";

export function assertInput<I, O, D>(
  schema: ZodType<O, D, I>,
  data: unknown
): asserts data is I {
  schema.parse(data);
}
