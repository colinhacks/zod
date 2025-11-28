import { test } from "vitest";
import type { StandardSchemaWithJSON } from "../../core/standard-schema.js";
import * as z from "../index.js";

function acceptSchema(schema: StandardSchemaWithJSON) {
  return schema;
}

test("Zod Mini schemas are NOT assignable to StandardJSONSchema", () => {
  const schema = z.string();

  // @ts-expect-error
  const _standard: StandardSchemaWithJSON["~standard"] = schema;

  // @ts-expect-error
  acceptSchema(schema);
});
