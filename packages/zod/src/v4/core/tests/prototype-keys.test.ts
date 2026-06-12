import { expect, test } from "vitest";
import * as z from "zod/v4";

test("z.treeifyError handles prototype keys", () => {
  const schema = z.object({ toString: z.string() });
  const result = schema.safeParse({ toString: 1 });
  const tree = z.treeifyError(result.error!);
  expect(tree.properties?.toString?.errors).toBeDefined();
  expect(tree.properties?.toString?.errors[0]).toBe("Invalid input: expected string, received number");
});