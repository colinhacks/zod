import * as z from "zod/v4";
import type { StandardJSONSchemaV1 } from "./packages/zod/src/v4/core/standard-schema.js";

function acceptSchema<T extends StandardJSONSchemaV1>(schema: T): StandardJSONSchemaV1.InferInput<T> {
  return schema as any;
}

const _arg = acceptSchema(z.string());

const a = z.toJSONSchema(
  z.codec(z.string(), z.number(), {
    decode: (value) => Number(value),
    encode: (value) => String(value),
  })
);
const b = a["~standard"].jsonSchema.input({ target: "draft-2020-12" });
const c = a["~standard"].jsonSchema.output({ target: "draft-2020-12" });
const d = a["~standard"].validate("123");

console.log({
  a,
  b,
  c,
  d,
});
