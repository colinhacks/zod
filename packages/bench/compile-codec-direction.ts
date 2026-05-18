import * as z from "zod/v4";
import * as zcore from "zod/v4/core";
import { metabench } from "./metabench.js";

const INVALID = Symbol("invalid");

const inputSchema = z.object({
  id: z.string(),
  count: z.number(),
  active: z.boolean(),
  nested: z.object({
    label: z.string(),
    score: z.number(),
  }),
});

const outputSchema = z.object({
  id: z.string(),
  count: z.number(),
  active: z.boolean(),
  nested: z.object({
    label: z.string(),
    score: z.number(),
  }),
  encoded: z.boolean(),
});

const codec = z.codec(inputSchema, outputSchema, {
  decode: (input) => ({ ...input, encoded: true }),
  encode: (output) => ({
    id: output.id,
    count: output.count,
    active: output.active,
    nested: output.nested,
  }),
});

const compiled = zcore.compile(codec);
const forward = zcore.compileFastpass(codec);

const input = {
  id: "abc",
  count: 123,
  active: true,
  nested: { label: "nested", score: 456 },
};

const output = { ...input, encoded: true };

function validateInput(value: any) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return INVALID;
  if (!("id" in value) || typeof value.id !== "string") return INVALID;
  if (!("count" in value) || typeof value.count !== "number" || !Number.isFinite(value.count)) return INVALID;
  if (!("active" in value) || typeof value.active !== "boolean") return INVALID;
  const nested = value.nested;
  if (typeof nested !== "object" || nested === null || Array.isArray(nested)) return INVALID;
  if (!("label" in nested) || typeof nested.label !== "string") return INVALID;
  if (!("score" in nested) || typeof nested.score !== "number" || !Number.isFinite(nested.score)) return INVALID;
  return {
    id: value.id,
    count: value.count,
    active: value.active,
    nested: { label: nested.label, score: nested.score },
  };
}

function validateOutput(value: any) {
  const base = validateInput(value);
  if (base === INVALID) return INVALID;
  if (!("encoded" in value) || typeof value.encoded !== "boolean") return INVALID;
  return { ...base, encoded: value.encoded };
}

function forwardBranchless(value: unknown) {
  const parsed = validateInput(value);
  if (parsed === INVALID) return INVALID;
  return { ...parsed, encoded: true };
}

function backwardBranchless(value: unknown) {
  const parsed = validateOutput(value);
  if (parsed === INVALID) return INVALID;
  return {
    id: parsed.id,
    count: parsed.count,
    active: parsed.active,
    nested: parsed.nested,
  };
}

function unifiedTopLevel(value: unknown, direction: "forward" | "backward") {
  return direction === "backward" ? backwardBranchless(value) : forwardBranchless(value);
}

function unifiedNestedBranch(value: unknown, direction: "forward" | "backward") {
  if (direction === "backward") {
    const parsed = validateOutput(value);
    if (parsed === INVALID) return INVALID;
    return {
      id: parsed.id,
      count: parsed.count,
      active: parsed.active,
      nested: parsed.nested,
    };
  }

  const parsed = validateInput(value);
  if (parsed === INVALID) return INVALID;
  return { ...parsed, encoded: true };
}

console.log("=== Correctness ===");
console.log("runtime decode:", codec.decode(input));
console.log("runtime encode:", codec.encode(output));
console.log("compiled decode:", compiled.decode(input));
console.log("manual forward:", forwardBranchless(input));
console.log("manual backward:", backwardBranchless(output));
console.log("");

await metabench("codec forward direction", {
  "current compileFastpass"() {
    return forward(input);
  },
  "manual branchless forward"() {
    return forwardBranchless(input);
  },
  "manual unified top-level branch"() {
    return unifiedTopLevel(input, "forward");
  },
  "manual unified nested branch"() {
    return unifiedNestedBranch(input, "forward");
  },
  "z.compile(codec).decode"() {
    return compiled.decode(input);
  },
  "runtime codec.decode"() {
    return codec.decode(input);
  },
}).run();

await metabench("codec backward direction", {
  "manual branchless backward"() {
    return backwardBranchless(output);
  },
  "manual unified top-level branch"() {
    return unifiedTopLevel(output, "backward");
  },
  "manual unified nested branch"() {
    return unifiedNestedBranch(output, "backward");
  },
  "runtime codec.encode"() {
    return codec.encode(output);
  },
}).run();

