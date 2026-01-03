import { metabench } from "./metabench.js";

// =============================================================================
// Isolate JUST object construction cost (no validation)
// =============================================================================

const DATA_LARGE = Array.from({ length: 1000 }, () => ({
  a: "1",
  b: "2",
  c: "3",
  d: "4",
  e: "5",
  f: "6",
  g: "7",
  h: "8",
  i: "9",
  j: "10",
  k: "11",
  l: "12",
  m: "13",
  n: "14",
  o: "15",
  p: "16",
  q: "17",
  r: "18",
  s: "19",
  t: "20",
  u: "21",
  v: "22",
  w: "23",
  x: "24",
  y: "25",
}));

// Just return input - no construction
function justReturn(input: Record<string, unknown>) {
  return input;
}

// Build object literal all at once
function buildLiteral(input: Record<string, unknown>) {
  return {
    a: input["a"],
    b: input["b"],
    c: input["c"],
    d: input["d"],
    e: input["e"],
    f: input["f"],
    g: input["g"],
    h: input["h"],
    i: input["i"],
    j: input["j"],
    k: input["k"],
    l: input["l"],
    m: input["m"],
    n: input["n"],
    o: input["o"],
    p: input["p"],
    q: input["q"],
    r: input["r"],
    s: input["s"],
    t: input["t"],
    u: input["u"],
    v: input["v"],
    w: input["w"],
    x: input["x"],
    y: input["y"],
  };
}

// Build incrementally (property by property)
function buildIncremental(input: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  out["a"] = input["a"];
  out["b"] = input["b"];
  out["c"] = input["c"];
  out["d"] = input["d"];
  out["e"] = input["e"];
  out["f"] = input["f"];
  out["g"] = input["g"];
  out["h"] = input["h"];
  out["i"] = input["i"];
  out["j"] = input["j"];
  out["k"] = input["k"];
  out["l"] = input["l"];
  out["m"] = input["m"];
  out["n"] = input["n"];
  out["o"] = input["o"];
  out["p"] = input["p"];
  out["q"] = input["q"];
  out["r"] = input["r"];
  out["s"] = input["s"];
  out["t"] = input["t"];
  out["u"] = input["u"];
  out["v"] = input["v"];
  out["w"] = input["w"];
  out["x"] = input["x"];
  out["y"] = input["y"];
  return out;
}

// Spread
function buildSpread(input: Record<string, unknown>) {
  return { ...input };
}

// Object.assign
function buildAssign(input: Record<string, unknown>) {
  return Object.assign({}, input);
}

console.log("=== Pure Object Construction (25 props, no validation) ===");
console.log("Input keys:", Object.keys(DATA_LARGE[0]).length);
console.log("");

const bench = metabench("object construction only (25 props)", {
  "just return input"() {
    for (const d of DATA_LARGE) justReturn(d);
  },
  "object literal"() {
    for (const d of DATA_LARGE) buildLiteral(d);
  },
  "incremental assignment"() {
    for (const d of DATA_LARGE) buildIncremental(d);
  },
  spread() {
    for (const d of DATA_LARGE) buildSpread(d);
  },
  "Object.assign"() {
    for (const d of DATA_LARGE) buildAssign(d);
  },
});

await bench.run();

// =============================================================================
// Now test with validation included
// =============================================================================

function validateAndReturn(input: Record<string, unknown>) {
  if (typeof input["a"] !== "string") return undefined;
  if (typeof input["b"] !== "string") return undefined;
  if (typeof input["c"] !== "string") return undefined;
  if (typeof input["d"] !== "string") return undefined;
  if (typeof input["e"] !== "string") return undefined;
  if (typeof input["f"] !== "string") return undefined;
  if (typeof input["g"] !== "string") return undefined;
  if (typeof input["h"] !== "string") return undefined;
  if (typeof input["i"] !== "string") return undefined;
  if (typeof input["j"] !== "string") return undefined;
  if (typeof input["k"] !== "string") return undefined;
  if (typeof input["l"] !== "string") return undefined;
  if (typeof input["m"] !== "string") return undefined;
  if (typeof input["n"] !== "string") return undefined;
  if (typeof input["o"] !== "string") return undefined;
  if (typeof input["p"] !== "string") return undefined;
  if (typeof input["q"] !== "string") return undefined;
  if (typeof input["r"] !== "string") return undefined;
  if (typeof input["s"] !== "string") return undefined;
  if (typeof input["t"] !== "string") return undefined;
  if (typeof input["u"] !== "string") return undefined;
  if (typeof input["v"] !== "string") return undefined;
  if (typeof input["w"] !== "string") return undefined;
  if (typeof input["x"] !== "string") return undefined;
  if (typeof input["y"] !== "string") return undefined;
  return input;
}

function validateAndBuildLiteral(input: Record<string, unknown>) {
  if (typeof input["a"] !== "string") return undefined;
  if (typeof input["b"] !== "string") return undefined;
  if (typeof input["c"] !== "string") return undefined;
  if (typeof input["d"] !== "string") return undefined;
  if (typeof input["e"] !== "string") return undefined;
  if (typeof input["f"] !== "string") return undefined;
  if (typeof input["g"] !== "string") return undefined;
  if (typeof input["h"] !== "string") return undefined;
  if (typeof input["i"] !== "string") return undefined;
  if (typeof input["j"] !== "string") return undefined;
  if (typeof input["k"] !== "string") return undefined;
  if (typeof input["l"] !== "string") return undefined;
  if (typeof input["m"] !== "string") return undefined;
  if (typeof input["n"] !== "string") return undefined;
  if (typeof input["o"] !== "string") return undefined;
  if (typeof input["p"] !== "string") return undefined;
  if (typeof input["q"] !== "string") return undefined;
  if (typeof input["r"] !== "string") return undefined;
  if (typeof input["s"] !== "string") return undefined;
  if (typeof input["t"] !== "string") return undefined;
  if (typeof input["u"] !== "string") return undefined;
  if (typeof input["v"] !== "string") return undefined;
  if (typeof input["w"] !== "string") return undefined;
  if (typeof input["x"] !== "string") return undefined;
  if (typeof input["y"] !== "string") return undefined;
  return {
    a: input["a"],
    b: input["b"],
    c: input["c"],
    d: input["d"],
    e: input["e"],
    f: input["f"],
    g: input["g"],
    h: input["h"],
    i: input["i"],
    j: input["j"],
    k: input["k"],
    l: input["l"],
    m: input["m"],
    n: input["n"],
    o: input["o"],
    p: input["p"],
    q: input["q"],
    r: input["r"],
    s: input["s"],
    t: input["t"],
    u: input["u"],
    v: input["v"],
    w: input["w"],
    x: input["x"],
    y: input["y"],
  };
}

console.log("=== With Validation (25 props) ===");

const bench2 = metabench("validate + construct (25 props)", {
  "validate + return input"() {
    for (const d of DATA_LARGE) validateAndReturn(d);
  },
  "validate + object literal"() {
    for (const d of DATA_LARGE) validateAndBuildLiteral(d);
  },
});

await bench2.run();
