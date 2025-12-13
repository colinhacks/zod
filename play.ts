import _Ajv from "ajv";
import * as z from "zod/v4";

const Ajv = typeof _Ajv === "function" ? _Ajv : (_Ajv as any).default;

const ajv = new Ajv({ allErrors: true });
z.config({ ajv });

const schema = z.jsonSchema({
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer", minimum: 0 },
  },
  required: ["name", "age"],
});

// Test cases
const result = schema.safeParse({ name: "Colin" });
console.log("Missing age:", result);

const result2 = schema.safeParse({ name: "Colin", age: -5 });
console.log("Negative age:", result2);

const result3 = schema.safeParse({ name: "Colin", age: 30 });
console.log("Valid:", result3);
