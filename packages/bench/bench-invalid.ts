import { type } from "arktype";
import { metabench } from "./metabench.js";

// Simulated pre-instantiated $ZodError
class $ZodError extends Error {
  issues: unknown[] = [];
}
const INVALID = new $ZodError();

const DATA = Array.from({ length: 1000 }, () =>
  Object.freeze({
    number: 1,
    negNumber: -1,
    maxNumber: Number.MAX_VALUE,
    string: "string",
    longString: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    boolean: true,
    deeplyNested: Object.freeze({
      foo: "bar",
      num: 1,
      bool: false,
    }),
  })
);

// Core _run function - returns T | $ZodError
function _run(input: any) {
  if (typeof input !== "object" || input === null) return INVALID;
  if (typeof input.number !== "number") return INVALID;
  if (typeof input.negNumber !== "number") return INVALID;
  if (typeof input.maxNumber !== "number") return INVALID;
  if (typeof input.string !== "string") return INVALID;
  if (typeof input.longString !== "string") return INVALID;
  if (typeof input.boolean !== "boolean") return INVALID;
  const dn = input.deeplyNested;
  if (typeof dn !== "object" || dn === null) return INVALID;
  if (typeof dn.foo !== "string") return INVALID;
  if (typeof dn.num !== "number") return INVALID;
  if (typeof dn.bool !== "boolean") return INVALID;
  return {
    number: input.number,
    negNumber: input.negNumber,
    maxNumber: input.maxNumber,
    string: input.string,
    longString: input.longString,
    boolean: input.boolean,
    deeplyNested: { foo: dn.foo, num: dn.num, bool: dn.bool },
  };
}

// safeParse() - wraps result
function safeParse(input: any) {
  const result = _run(input);
  if (result === INVALID) return { success: false as const, error: INVALID };
  return { success: true as const, data: result };
}

// ArkType schema for comparison
const arkSchema = type({
  number: "number",
  negNumber: "number",
  maxNumber: "number",
  string: "string",
  longString: "string",
  boolean: "boolean",
  deeplyNested: {
    foo: "string",
    num: "number",
    bool: "boolean",
  },
});

export let sink: any;

metabench("valid: check method comparison", {
  "=== INVALID"() {
    for (const item of DATA) {
      const r = _run(item);
      if (r === INVALID) sink = null;
      else sink = r;
    }
  },
  "instanceof $ZodError"() {
    for (const item of DATA) {
      const r = _run(item);
      if (r instanceof $ZodError) sink = null;
      else sink = r;
    }
  },
  safeParse() {
    for (const item of DATA) {
      const r = safeParse(item);
      if (!r.success) sink = null;
      else sink = r.data;
    }
  },
  "arktype (instanceof)"() {
    for (const item of DATA) {
      const r = arkSchema(item);
      if (r instanceof type.errors) sink = null;
      else sink = r;
    }
  },
}).run();

// Invalid data - wrong type on first check
const INVALID_DATA = Array.from({ length: 1000 }, () =>
  Object.freeze({
    number: "not a number", // wrong type - fails fast
    negNumber: -1,
    maxNumber: Number.MAX_VALUE,
    string: "string",
    longString: "Lorem ipsum dolor sit amet.",
    boolean: true,
    deeplyNested: Object.freeze({ foo: "bar", num: 1, bool: false }),
  })
);

metabench("invalid: check method comparison", {
  "=== INVALID"() {
    for (const item of INVALID_DATA) {
      const r = _run(item);
      if (r === INVALID) sink = null;
      else sink = r;
    }
  },
  "instanceof $ZodError"() {
    for (const item of INVALID_DATA) {
      const r = _run(item);
      if (r instanceof $ZodError) sink = null;
      else sink = r;
    }
  },
  safeParse() {
    for (const item of INVALID_DATA) {
      const r = safeParse(item);
      if (!r.success) sink = null;
      else sink = r.data;
    }
  },
  "arktype (instanceof)"() {
    for (const item of INVALID_DATA) {
      const r = arkSchema(item);
      if (r instanceof type.errors) sink = null;
      else sink = r;
    }
  },
}).run();
