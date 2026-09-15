import { metabench } from "./metabench.js";

// =============================================================================
// Question: how much does a safeParse-style { success, data } wrapper cost
// across schema shapes (primitive / flat object / nested object)?
//
// Compares 3 return signatures:
//   sentinel:  T | INVALID                       (current compile() shape)
//   tagged:    { success: true, data: T } | { success: false, error }
//   plain:     T | undefined                     (also non-allocating on success)
// =============================================================================

const ERROR = Symbol("error");

// Sink prevents V8 escape analysis from eliminating wrapper allocations
export let SINK: any = null;

// ----- primitive: string -----
const STR_DATA = Array.from({ length: 1000 }, (_, i) => (i % 7 === 0 ? 42 : "hello"));

function strSentinel(input: unknown) {
  if (typeof input !== "string") return ERROR;
  return input;
}

function strTagged(input: unknown) {
  if (typeof input !== "string") return { success: false as const, error: ERROR };
  return { success: true as const, data: input };
}

function strPlain(input: unknown) {
  if (typeof input !== "string") return undefined;
  return input;
}

metabench("primitive (string) - return shape", {
  "T | INVALID"() {
    for (const d of STR_DATA) SINK = strSentinel(d);
  },
  "{ success, data }"() {
    for (const d of STR_DATA) SINK = strTagged(d);
  },
  "T | undefined"() {
    for (const d of STR_DATA) SINK = strPlain(d);
  },
}).run();

// ----- flat object -----
const OBJ_DATA = Array.from({ length: 1000 }, (_, i) =>
  i % 7 === 0 ? null : { name: "alice", age: 30, active: true }
);

function objSentinel(input: any) {
  if (typeof input !== "object" || input === null) return ERROR;
  if (typeof input.name !== "string") return ERROR;
  if (typeof input.age !== "number") return ERROR;
  if (typeof input.active !== "boolean") return ERROR;
  return { name: input.name, age: input.age, active: input.active };
}

function objTagged(input: any) {
  if (typeof input !== "object" || input === null) return { success: false as const, error: ERROR };
  if (typeof input.name !== "string") return { success: false as const, error: ERROR };
  if (typeof input.age !== "number") return { success: false as const, error: ERROR };
  if (typeof input.active !== "boolean") return { success: false as const, error: ERROR };
  return { success: true as const, data: { name: input.name, age: input.age, active: input.active } };
}

function objPlain(input: any) {
  if (typeof input !== "object" || input === null) return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  return { name: input.name, age: input.age, active: input.active };
}

metabench("flat object (3 props) - return shape", {
  "T | INVALID"() {
    for (const d of OBJ_DATA) SINK = objSentinel(d);
  },
  "{ success, data }"() {
    for (const d of OBJ_DATA) SINK = objTagged(d);
  },
  "T | undefined"() {
    for (const d of OBJ_DATA) SINK = objPlain(d);
  },
}).run();

// ----- nested object -----
const NESTED_DATA = Array.from({ length: 1000 }, (_, i) =>
  i % 7 === 0
    ? null
    : {
        number: 1,
        negNumber: -1,
        maxNumber: Number.MAX_VALUE,
        string: "hello",
        longString: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        boolean: true,
        deeplyNested: { foo: "bar", num: 1, bool: false },
      }
);

function nestedSentinel(input: any) {
  if (typeof input !== "object" || input === null) return ERROR;
  if (typeof input.number !== "number") return ERROR;
  if (typeof input.negNumber !== "number") return ERROR;
  if (typeof input.maxNumber !== "number") return ERROR;
  if (typeof input.string !== "string") return ERROR;
  if (typeof input.longString !== "string") return ERROR;
  if (typeof input.boolean !== "boolean") return ERROR;
  const dn = input.deeplyNested;
  if (typeof dn !== "object" || dn === null) return ERROR;
  if (typeof dn.foo !== "string") return ERROR;
  if (typeof dn.num !== "number") return ERROR;
  if (typeof dn.bool !== "boolean") return ERROR;
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

function nestedTagged(input: any) {
  const r = nestedSentinel(input);
  if (r === ERROR) return { success: false as const, error: ERROR };
  return { success: true as const, data: r };
}

function nestedPlain(input: any) {
  const r = nestedSentinel(input);
  if (r === ERROR) return undefined;
  return r;
}

metabench("nested object (moltar) - return shape", {
  "T | INVALID"() {
    for (const d of NESTED_DATA) SINK = nestedSentinel(d);
  },
  "{ success, data }"() {
    for (const d of NESTED_DATA) SINK = nestedTagged(d);
  },
  "T | undefined"() {
    for (const d of NESTED_DATA) SINK = nestedPlain(d);
  },
}).run();
