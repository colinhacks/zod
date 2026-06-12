import { type } from "arktype";
import * as z from "zod/v4";
import * as zcore from "zod/v4/core";
import { metabench } from "./metabench.js";

const caseOrder = ["simple", "nested", "array", "array-objects", "du", "intersection", "xor"] as const;
type BenchmarkCase = (typeof caseOrder)[number];

const caseLabels: Record<BenchmarkCase, string> = {
  simple: "simple object",
  nested: "nested object",
  array: "array of numbers",
  "array-objects": "array of objects",
  du: "discriminated union",
  intersection: "intersection",
  xor: "xor",
};

const caseAliases: Record<string, BenchmarkCase | "all"> = {
  all: "all",
  simple: "simple",
  nested: "nested",
  array: "array",
  "array-objects": "array-objects",
  du: "du",
  "discriminated-union": "du",
  intersection: "intersection",
  xor: "xor",
};

type ParsedArgs = {
  cases: BenchmarkCase[];
  list: boolean;
};

function printAvailableCases(): void {
  console.log("Available benchmark cases:");
  for (const caseName of caseOrder) {
    const alias = caseName === "du" ? " (alias: discriminated-union)" : "";
    console.log(`  ${caseName}${alias} - ${caseLabels[caseName]}`);
  }
  console.log("  all - run every benchmark case");
}

function parseCaseValue(value: string): string[] {
  const cases = value
    .split(",")
    .map((caseName) => caseName.trim())
    .filter(Boolean);
  if (cases.length === 0) {
    throw new Error("--case requires a non-empty case name");
  }
  return cases;
}

function parseArgs(argv: string[]): ParsedArgs {
  const requestedCases: string[] = [];
  let list = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") continue;
    if (arg === "--list") {
      list = true;
      continue;
    }
    if (arg === "--case") {
      const value = argv[++i];
      if (!value || value.startsWith("--")) {
        throw new Error("--case requires a value, e.g. --case simple");
      }
      requestedCases.push(...parseCaseValue(value));
      continue;
    }
    if (arg.startsWith("--case=")) {
      requestedCases.push(...parseCaseValue(arg.slice("--case=".length)));
      continue;
    }
    throw new Error(`Unknown argument "${arg}". Use --case <name> or --list.`);
  }

  if (requestedCases.length === 0) {
    return { cases: [...caseOrder], list };
  }

  const selectedCases = new Set<BenchmarkCase>();
  for (const requestedCase of requestedCases) {
    const caseName = caseAliases[requestedCase];
    if (!caseName) {
      throw new Error(`Unknown benchmark case "${requestedCase}".`);
    }
    if (caseName === "all") {
      return { cases: [...caseOrder], list };
    }
    selectedCases.add(caseName);
  }

  return { cases: caseOrder.filter((caseName) => selectedCases.has(caseName)), list };
}

function parseArgsOrExit(): ParsedArgs {
  try {
    return parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    printAvailableCases();
    process.exit(1);
  }
}

const parsedArgs = parseArgsOrExit();
if (parsedArgs.list) {
  printAvailableCases();
  process.exit(0);
}

const selectedCases = parsedArgs.cases;
const selectedCaseSet = new Set<BenchmarkCase>(selectedCases);

console.log(`Running benchmark cases: ${selectedCases.map((caseName) => caseLabels[caseName]).join(", ")}`);
console.log("");

// ============================================
// SCHEMA DEFINITIONS
// ============================================

// Simple object schema
const zodSimple = z.object({
  name: z.string(),
  age: z.number(),
});

const arktypeSimple = type({
  name: "string",
  age: "number",
});

// Nested object schema (matches moltar benchmark)
const zodNested = z.strictObject({
  number: z.number(),
  negNumber: z.number(),
  maxNumber: z.number(),
  string: z.string(),
  longString: z.string(),
  boolean: z.boolean(),
  deeplyNested: z.strictObject({
    foo: z.string(),
    num: z.number(),
    bool: z.boolean(),
  }),
});

const arktypeNested = type({
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

// Array schema
const zodArray = z.array(z.number());
const arktypeArray = type("number[]");

// Array of objects
const zodArrayOfObjects = z.array(z.object({ id: z.number(), name: z.string() }));
const arktypeArrayOfObjects = type({ id: "number", name: "string" }).array();

// Discriminated union
const zodDiscriminated = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), value: z.string() }),
  z.object({ kind: z.literal("count"), value: z.number() }),
  z.object({ kind: z.literal("flag"), value: z.boolean() }),
]);

const arktypeDiscriminated = type({
  kind: "'text'",
  value: "string",
})
  .or({ kind: "'count'", value: "number" })
  .or({ kind: "'flag'", value: "boolean" });

// Intersection / deep merge
const zodIntersection = z.intersection(
  z.object({ nested: z.object({ a: z.string() }) }),
  z.object({ nested: z.object({ b: z.number() }) })
);

const zodXor = z.xor([z.string(), z.number(), z.boolean()]);

// Compiled Zod schemas (public API) + raw fast paths (lower-level primitive)
const zodSimpleCompiled = zcore.compile(zodSimple);
const zodNestedCompiled = zcore.compile(zodNested);
const zodArrayCompiled = zcore.compile(zodArray);
const zodArrayOfObjectsCompiled = zcore.compile(zodArrayOfObjects);
const zodDiscriminatedCompiled = zcore.compile(zodDiscriminated);
const zodIntersectionCompiled = zcore.compile(zodIntersection);
const zodXorCompiled = zcore.compile(zodXor);

const zodSimpleFastpass = zcore.compileFastpass(zodSimple);
const zodNestedFastpass = zcore.compileFastpass(zodNested);
const zodArrayFastpass = zcore.compileFastpass(zodArray);
const zodArrayOfObjectsFastpass = zcore.compileFastpass(zodArrayOfObjects);
const zodDiscriminatedFastpass = zcore.compileFastpass(zodDiscriminated);
const zodIntersectionFastpass = zcore.compileFastpass(zodIntersection);
const zodXorFastpass = zcore.compileFastpass(zodXor);

// ============================================
// TEST DATA
// ============================================

const simpleData = { name: "Alice", age: 30 };

const nestedData = {
  number: 1,
  negNumber: -1,
  maxNumber: Number.MAX_VALUE,
  string: "string",
  longString:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  boolean: true,
  deeplyNested: {
    foo: "bar",
    num: 1,
    bool: false,
  },
};

const arrayData = Array.from({ length: 100 }, (_, i) => i);
const arrayOfObjectsData = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));
const discriminatedData = { kind: "count", value: 123 };
const intersectionData = { nested: { a: "x", b: 123 } };
const xorData = "hello";

// ============================================
// HANDWRITTEN VALIDATORS (baseline)
// ============================================

const INVALID = Symbol("invalid");

function handwrittenSimple(input: unknown): { name: string; age: number } | typeof INVALID {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return INVALID;
  const obj = input as Record<string, unknown>;
  if (typeof obj.name !== "string") return INVALID;
  if (typeof obj.age !== "number" || Number.isNaN(obj.age)) return INVALID;
  return { name: obj.name, age: obj.age };
}

function handwrittenNested(input: unknown): any | typeof INVALID {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return INVALID;
  const obj = input as Record<string, unknown>;
  if (typeof obj.number !== "number" || Number.isNaN(obj.number)) return INVALID;
  if (typeof obj.negNumber !== "number" || Number.isNaN(obj.negNumber)) return INVALID;
  if (typeof obj.maxNumber !== "number" || Number.isNaN(obj.maxNumber)) return INVALID;
  if (typeof obj.string !== "string") return INVALID;
  if (typeof obj.longString !== "string") return INVALID;
  if (typeof obj.boolean !== "boolean") return INVALID;
  const dn = obj.deeplyNested;
  if (typeof dn !== "object" || dn === null || Array.isArray(dn)) return INVALID;
  const dnObj = dn as Record<string, unknown>;
  if (typeof dnObj.foo !== "string") return INVALID;
  if (typeof dnObj.num !== "number" || Number.isNaN(dnObj.num)) return INVALID;
  if (typeof dnObj.bool !== "boolean") return INVALID;
  return {
    number: obj.number,
    negNumber: obj.negNumber,
    maxNumber: obj.maxNumber,
    string: obj.string,
    longString: obj.longString,
    boolean: obj.boolean,
    deeplyNested: { foo: dnObj.foo, num: dnObj.num, bool: dnObj.bool },
  };
}

function handwrittenArray(input: unknown): number[] | typeof INVALID {
  if (!Array.isArray(input)) return INVALID;
  const result = new Array(input.length);
  for (let i = 0; i < input.length; i++) {
    if (typeof input[i] !== "number" || Number.isNaN(input[i])) return INVALID;
    result[i] = input[i];
  }
  return result;
}

// ============================================
// VERIFY CORRECTNESS & CHECK OBJECT IDENTITY
// ============================================

if (selectedCaseSet.has("simple") || selectedCaseSet.has("nested")) {
  console.log("=== Correctness Check ===");
  if (selectedCaseSet.has("simple")) {
    console.log("Zod safeParse simple:", zodSimple.safeParse(simpleData).success);
    console.log("z.compile() simple:", zodSimpleCompiled.safeParse(simpleData).success);
    console.log("z.compileFastpass() simple:", zodSimpleFastpass(simpleData) !== zcore.INVALID);
    console.log("Arktype simple:", !(arktypeSimple(simpleData) instanceof type.errors));
    console.log("Handwritten simple:", handwrittenSimple(simpleData) !== INVALID);
    console.log("");
  }
  if (selectedCaseSet.has("nested")) {
    console.log("Zod safeParse nested:", zodNested.safeParse(nestedData).success);
    console.log("z.compile() nested:", zodNestedCompiled.safeParse(nestedData).success);
    console.log("z.compileFastpass() nested:", zodNestedFastpass(nestedData) !== zcore.INVALID);
    console.log("Arktype nested:", !(arktypeNested(nestedData) instanceof type.errors));
    console.log("Handwritten nested:", handwrittenNested(nestedData) !== INVALID);
    console.log("");
  }
}

// Check if arktype returns the same object or a new one
if (selectedCaseSet.has("simple") || selectedCaseSet.has("nested")) {
  console.log("=== Object Identity Check ===");
  if (selectedCaseSet.has("simple")) {
    const arktypeResult = arktypeSimple(simpleData);
    const zodResult = zodSimple.safeParse(simpleData);
    const handwrittenResult = handwrittenSimple(simpleData);

    console.log("Arktype returns same object:", arktypeResult === simpleData);
    console.log("Zod returns same object:", zodResult.success && zodResult.data === simpleData);
    console.log("Handwritten returns same object:", handwrittenResult === simpleData);
    console.log("");
  }

  // Check nested too
  if (selectedCaseSet.has("nested")) {
    const arktypeNestedResult = arktypeNested(nestedData);
    const zodNestedResult = zodNested.safeParse(nestedData);
    console.log("Arktype nested returns same object:", arktypeNestedResult === nestedData);
    console.log("Zod nested returns same object:", zodNestedResult.success && zodNestedResult.data === nestedData);
    console.log("");
  }
}

// ============================================
// BENCHMARKS
// ============================================

const benchmarkCases: Record<BenchmarkCase, () => Promise<void>> = {
  async simple() {
    await metabench("simple object { name, age }", {
      handwritten() {
        return handwrittenSimple(simpleData);
      },
      arktype() {
        return arktypeSimple(simpleData);
      },
      "z.compile().safeParse"() {
        return zodSimpleCompiled.safeParse(simpleData);
      },
      "z.compileFastpass()"() {
        return zodSimpleFastpass(simpleData);
      },
      "zod safeParse"() {
        return zodSimple.safeParse(simpleData);
      },
    }).run();
  },
  async nested() {
    await metabench("nested object (moltar schema)", {
      handwritten() {
        return handwrittenNested(nestedData);
      },
      arktype() {
        return arktypeNested(nestedData);
      },
      "z.compile().safeParse"() {
        return zodNestedCompiled.safeParse(nestedData);
      },
      "z.compileFastpass()"() {
        return zodNestedFastpass(nestedData);
      },
      "zod safeParse"() {
        return zodNested.safeParse(nestedData);
      },
    }).run();
  },
  async array() {
    await metabench("array of 100 numbers", {
      handwritten() {
        return handwrittenArray(arrayData);
      },
      arktype() {
        return arktypeArray(arrayData);
      },
      "z.compile().safeParse"() {
        return zodArrayCompiled.safeParse(arrayData);
      },
      "z.compileFastpass()"() {
        return zodArrayFastpass(arrayData);
      },
      "zod safeParse"() {
        return zodArray.safeParse(arrayData);
      },
    }).run();
  },
  async "array-objects"() {
    await metabench("array of 50 objects", {
      arktype() {
        return arktypeArrayOfObjects(arrayOfObjectsData);
      },
      "z.compile().safeParse"() {
        return zodArrayOfObjectsCompiled.safeParse(arrayOfObjectsData);
      },
      "z.compileFastpass()"() {
        return zodArrayOfObjectsFastpass(arrayOfObjectsData);
      },
      "zod safeParse"() {
        return zodArrayOfObjects.safeParse(arrayOfObjectsData);
      },
    }).run();
  },
  async du() {
    await metabench("discriminated union (3 branches)", {
      arktype() {
        return arktypeDiscriminated(discriminatedData);
      },
      "z.compile().safeParse"() {
        return zodDiscriminatedCompiled.safeParse(discriminatedData);
      },
      "z.compileFastpass()"() {
        return zodDiscriminatedFastpass(discriminatedData);
      },
      "zod safeParse"() {
        return zodDiscriminated.safeParse(discriminatedData);
      },
    }).run();
  },
  async intersection() {
    await metabench("intersection deep merge", {
      "z.compile().safeParse"() {
        return zodIntersectionCompiled.safeParse(intersectionData);
      },
      "z.compileFastpass()"() {
        return zodIntersectionFastpass(intersectionData);
      },
      "zod safeParse"() {
        return zodIntersection.safeParse(intersectionData);
      },
    }).run();
  },
  async xor() {
    await metabench("xor union (3 branches, one match)", {
      "z.compile().safeParse"() {
        return zodXorCompiled.safeParse(xorData);
      },
      "z.compileFastpass()"() {
        return zodXorFastpass(xorData);
      },
      "zod safeParse"() {
        return zodXor.safeParse(xorData);
      },
    }).run();
  },
};

for (const caseName of selectedCases) {
  console.log(`=== Running case: ${caseName} (${caseLabels[caseName]}) ===`);
  await benchmarkCases[caseName]();
}
