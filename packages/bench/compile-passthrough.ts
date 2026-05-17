import { metabench } from "./metabench.js";

// =============================================================================
// Compare: return input vs build new object (no transforms)
// =============================================================================

// Small object (3 props)
const DATA_SMALL = Array.from({ length: 1000 }, () => ({
  name: "hello",
  age: 42,
  active: true,
}));

function smallReturnInput(input: Record<string, unknown>) {
  if (typeof input !== "object") return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  return input;
}

function smallBuildNew(input: Record<string, unknown>) {
  if (typeof input !== "object") return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  return {
    name: input.name,
    age: input.age,
    active: input.active,
  };
}

function smallSpread(input: Record<string, unknown>) {
  if (typeof input !== "object") return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  return { ...input };
}

console.log("=== Small Object (3 props) ===");
console.log("Return input:", smallReturnInput(DATA_SMALL[0]));
console.log("Build new:", smallBuildNew(DATA_SMALL[0]));
console.log("Spread:", smallSpread(DATA_SMALL[0]));
console.log("");

const benchSmall = metabench("small object (3 props) - no transform", {
  "return input"() {
    for (const d of DATA_SMALL) smallReturnInput(d);
  },
  "build new object"() {
    for (const d of DATA_SMALL) smallBuildNew(d);
  },
  "spread clone"() {
    for (const d of DATA_SMALL) smallSpread(d);
  },
});

await benchSmall.run();

// Medium object (10 props)
const DATA_MEDIUM = Array.from({ length: 1000 }, () => ({
  id: "abc123",
  name: "hello",
  email: "test@example.com",
  age: 42,
  score: 99.5,
  active: true,
  verified: false,
  role: "admin",
  level: 5,
  count: 100,
}));

function mediumReturnInput(input: Record<string, unknown>) {
  if (typeof input !== "object") return undefined;
  if (typeof input.id !== "string") return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.email !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.score !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  if (typeof input.verified !== "boolean") return undefined;
  if (typeof input.role !== "string") return undefined;
  if (typeof input.level !== "number") return undefined;
  if (typeof input.count !== "number") return undefined;
  return input;
}

function mediumBuildNew(input: Record<string, unknown>) {
  if (typeof input !== "object") return undefined;
  if (typeof input.id !== "string") return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.email !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.score !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  if (typeof input.verified !== "boolean") return undefined;
  if (typeof input.role !== "string") return undefined;
  if (typeof input.level !== "number") return undefined;
  if (typeof input.count !== "number") return undefined;
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    age: input.age,
    score: input.score,
    active: input.active,
    verified: input.verified,
    role: input.role,
    level: input.level,
    count: input.count,
  };
}

function mediumSpread(input: Record<string, unknown>) {
  if (typeof input !== "object") return undefined;
  if (typeof input.id !== "string") return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.email !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.score !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  if (typeof input.verified !== "boolean") return undefined;
  if (typeof input.role !== "string") return undefined;
  if (typeof input.level !== "number") return undefined;
  if (typeof input.count !== "number") return undefined;
  return { ...input };
}

console.log("=== Medium Object (10 props) ===");
console.log("Return input:", mediumReturnInput(DATA_MEDIUM[0]));
console.log("");

const benchMedium = metabench("medium object (10 props) - no transform", {
  "return input"() {
    for (const d of DATA_MEDIUM) mediumReturnInput(d);
  },
  "build new object"() {
    for (const d of DATA_MEDIUM) mediumBuildNew(d);
  },
  "spread clone"() {
    for (const d of DATA_MEDIUM) mediumSpread(d);
  },
});

await benchMedium.run();

// Large object (25 props)
const DATA_LARGE = Array.from({ length: 1000 }, () => ({
  id: "abc123",
  name: "hello",
  email: "test@example.com",
  age: 42,
  score: 99.5,
  active: true,
  verified: false,
  role: "admin",
  level: 5,
  count: 100,
  firstName: "John",
  lastName: "Doe",
  phone: "555-1234",
  address: "123 Main St",
  city: "Springfield",
  state: "IL",
  zip: "62701",
  country: "USA",
  company: "Acme Inc",
  title: "Engineer",
  department: "R&D",
  salary: 100000,
  bonus: 10000,
  startDate: "2020-01-01",
  endDate: null,
}));

function largeReturnInput(input: Record<string, unknown>) {
  if (typeof input !== "object") return undefined;
  // Validate all 25 props
  if (typeof input.id !== "string") return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.email !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.score !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  if (typeof input.verified !== "boolean") return undefined;
  if (typeof input.role !== "string") return undefined;
  if (typeof input.level !== "number") return undefined;
  if (typeof input.count !== "number") return undefined;
  if (typeof input.firstName !== "string") return undefined;
  if (typeof input.lastName !== "string") return undefined;
  if (typeof input.phone !== "string") return undefined;
  if (typeof input.address !== "string") return undefined;
  if (typeof input.city !== "string") return undefined;
  if (typeof input.state !== "string") return undefined;
  if (typeof input.zip !== "string") return undefined;
  if (typeof input.country !== "string") return undefined;
  if (typeof input.company !== "string") return undefined;
  if (typeof input.title !== "string") return undefined;
  if (typeof input.department !== "string") return undefined;
  if (typeof input.salary !== "number") return undefined;
  if (typeof input.bonus !== "number") return undefined;
  if (typeof input.startDate !== "string") return undefined;
  // endDate can be null
  return input;
}

function largeBuildNew(input: Record<string, unknown>) {
  if (typeof input !== "object") return undefined;
  if (typeof input.id !== "string") return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.email !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.score !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  if (typeof input.verified !== "boolean") return undefined;
  if (typeof input.role !== "string") return undefined;
  if (typeof input.level !== "number") return undefined;
  if (typeof input.count !== "number") return undefined;
  if (typeof input.firstName !== "string") return undefined;
  if (typeof input.lastName !== "string") return undefined;
  if (typeof input.phone !== "string") return undefined;
  if (typeof input.address !== "string") return undefined;
  if (typeof input.city !== "string") return undefined;
  if (typeof input.state !== "string") return undefined;
  if (typeof input.zip !== "string") return undefined;
  if (typeof input.country !== "string") return undefined;
  if (typeof input.company !== "string") return undefined;
  if (typeof input.title !== "string") return undefined;
  if (typeof input.department !== "string") return undefined;
  if (typeof input.salary !== "number") return undefined;
  if (typeof input.bonus !== "number") return undefined;
  if (typeof input.startDate !== "string") return undefined;
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    age: input.age,
    score: input.score,
    active: input.active,
    verified: input.verified,
    role: input.role,
    level: input.level,
    count: input.count,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    address: input.address,
    city: input.city,
    state: input.state,
    zip: input.zip,
    country: input.country,
    company: input.company,
    title: input.title,
    department: input.department,
    salary: input.salary,
    bonus: input.bonus,
    startDate: input.startDate,
    endDate: input.endDate,
  };
}

function largeSpread(input: Record<string, unknown>) {
  if (typeof input !== "object") return undefined;
  if (typeof input.id !== "string") return undefined;
  if (typeof input.name !== "string") return undefined;
  if (typeof input.email !== "string") return undefined;
  if (typeof input.age !== "number") return undefined;
  if (typeof input.score !== "number") return undefined;
  if (typeof input.active !== "boolean") return undefined;
  if (typeof input.verified !== "boolean") return undefined;
  if (typeof input.role !== "string") return undefined;
  if (typeof input.level !== "number") return undefined;
  if (typeof input.count !== "number") return undefined;
  if (typeof input.firstName !== "string") return undefined;
  if (typeof input.lastName !== "string") return undefined;
  if (typeof input.phone !== "string") return undefined;
  if (typeof input.address !== "string") return undefined;
  if (typeof input.city !== "string") return undefined;
  if (typeof input.state !== "string") return undefined;
  if (typeof input.zip !== "string") return undefined;
  if (typeof input.country !== "string") return undefined;
  if (typeof input.company !== "string") return undefined;
  if (typeof input.title !== "string") return undefined;
  if (typeof input.department !== "string") return undefined;
  if (typeof input.salary !== "number") return undefined;
  if (typeof input.bonus !== "number") return undefined;
  if (typeof input.startDate !== "string") return undefined;
  return { ...input };
}

console.log("=== Large Object (25 props) ===");
console.log("Keys:", Object.keys(DATA_LARGE[0]).length);
console.log("");

const benchLarge = metabench("large object (25 props) - no transform", {
  "return input"() {
    for (const d of DATA_LARGE) largeReturnInput(d);
  },
  "build new object"() {
    for (const d of DATA_LARGE) largeBuildNew(d);
  },
  "spread clone"() {
    for (const d of DATA_LARGE) largeSpread(d);
  },
});

await benchLarge.run();
