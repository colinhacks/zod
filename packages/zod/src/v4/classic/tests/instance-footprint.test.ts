import { expect, test } from "vitest";

import * as zm from "zod/mini";
import * as z from "zod/v4";
import * as core from "zod/v4/core";

// V8 sizes an instance's property backing store in steps, and schema instances get no in-object slots (their constructor assigns nothing itself): 12 own properties cost 128 bytes, 13 cost 848, 21 cost 1616. Methods therefore live on the prototype and materialize per instance on first read. These bounds are what keeps a schema graph small; crossing one silently multiplies its memory by 6x.
const MAX_OWN_PROPS = 12;

test("schema instances stay under V8's property-count step", () => {
  const cases: Array<[string, object]> = [
    ["string", z.string()],
    ["number", z.number()],
    ["bigint", z.bigint()],
    ["boolean", z.boolean()],
    ["date", z.date()],
    ["enum", z.enum(["a", "b"])],
    ["array", z.array(z.string())],
    ["object", z.object({ a: z.string() })],
    ["record", z.record(z.string(), z.string())],
    ["map", z.map(z.string(), z.string())],
    ["set", z.set(z.string())],
    ["union", z.union([z.string(), z.number()])],
    ["optional", z.string().optional()],
    ["pipe", z.string().pipe(z.string())],
    ["email", z.email()],
    ["mini string", zm.string()],
    ["mini object", zm.object({ a: zm.string() })],
  ];

  const over = cases
    .map(([name, schema]) => [name, Reflect.ownKeys(schema).length] as const)
    .filter(([, count]) => count > MAX_OWN_PROPS);

  expect(over).toEqual([]);
});

test("prototype-installed members survive detaching", () => {
  const schema = z.string();
  const { parse, safeParse, spa } = schema;

  expect(parse("hi")).toEqual("hi");
  expect(safeParse("hi").success).toEqual(true);
  expect(["a", "b"].map((v) => parse(v))).toEqual(["a", "b"]);
  expect(spa).toBe(schema.safeParseAsync);

  const email = schema.email;
  expect(email().safeParse("a@b.co").success).toEqual(true);
});

test("prototype-installed members can be overwritten per instance", () => {
  const schema: any = z.string();
  schema.parse = () => "overridden";

  expect(schema.parse("anything")).toEqual("overridden");
  expect(z.string().parse("untouched")).toEqual("untouched");
});

test("~standard is lazy but complete", () => {
  const schema = z.string();

  expect(Object.prototype.hasOwnProperty.call(schema, "~standard")).toEqual(false);
  expect(schema["~standard"].vendor).toEqual("zod");
  expect(schema["~standard"].version).toEqual(1);
  expect(schema["~standard"].validate("hi")).toEqual({ value: "hi" });
  expect((schema["~standard"] as any).jsonSchema.input()).toMatchObject({ type: "string" });
  // Reading it caches on the instance, so the getter runs once.
  expect(Object.prototype.hasOwnProperty.call(schema, "~standard")).toEqual(true);
});

test("caching a lazy member preserves its original enumerability", () => {
  const schema = z.string();

  // Methods were enumerable own properties before they moved to the prototype, so touching one still surfaces it to `Object.keys`.
  void schema.parse;
  void schema.optional;
  expect(Object.keys(schema)).toContain("parse");
  expect(Object.keys(schema)).toContain("optional");

  // `~standard` never was an own data property, so caching it must not add it to `Object.keys` or to `JSON.stringify` of a schema.
  void schema["~standard"];
  expect(Object.keys(schema)).not.toContain("~standard");
  expect(JSON.stringify(schema)).not.toContain("~standard");

  // An explicit assignment behaves like one, as before.
  const other: any = z.string();
  other["~standard"] = { vendor: "x" };
  expect(Object.keys(other)).toContain("~standard");
});

test("_def stays read-only", () => {
  expect(() => {
    (z.string() as any)._def = {};
  }).toThrow(TypeError);
  expect(() => {
    (z.function({ input: [z.string()], output: z.number() }) as any)._def = {};
  }).toThrow(TypeError);
  const schema = z.string();
  expect(schema._def).toBe(schema._zod.def);
  expect(z.object({ a: z.string() })._def.type).toEqual("object");
});

test("deferred initializers are released after construction", () => {
  expect(z.string()._zod.deferred).toEqual(undefined);
  expect(z.object({ a: z.string() })._zod.deferred).toEqual(undefined);
});

test("a trait initializer called directly still installs its members", () => {
  // a direct `init` installs onto the receiver's own prototype, since it is not below the constructor's
  z.string();

  const proto = {};
  const inst = Object.create(proto) as z.ZodString;
  z.ZodString.init(inst, { type: "string" });

  expect(typeof inst.email).toBe("function");
  expect(typeof inst.optional).toBe("function");
  expect(Object.prototype.hasOwnProperty.call(proto, "email")).toBe(true);
});

test("a nested init during a repeat construction still installs its members", () => {
  // the install used to read a module-level flag the outer construction set, so a nested `init` on an unrelated receiver inherited an answer that was not about it
  const seen: string[] = [];

  // an assertion signature needs the call target explicitly annotated
  const Nested: core.$constructor<any> = core.$constructor<any>("Nested", () => {}, {
    tag() {
      return "nested";
    },
  });
  const Outer = core.$constructor<any>("Outer", (_inst, def) => {
    if (!def.nest) return;
    // not a plain `{}`: the install target would resolve to `Object.prototype` and leak `tag` into every object the worker touches
    const plain: any = Object.create({});
    Nested.init(plain, {});
    seen.push(typeof plain.tag);
  });

  new Outer({ nest: false });
  new Outer({ nest: true });

  expect(seen).toEqual(["function"]);
});

test("a derived trait's members win over the ones it composes", () => {
  // Classic installs a richer `~standard` over core's. Trait dedupe is what orders them: core's initializer runs once, at the first `init` that reaches it, so classic's always lands second.
  expect(typeof (z.string()["~standard"] as any).jsonSchema.input).toBe("function");
});

test("a live member keeps the descriptor a prototype member had", () => {
  // An object literal's getter is enumerable; the `defineProperty` it replaced was not. `for..in` over a schema is public surface, and the construction path walks the prototype with it.
  const proto = Object.getPrototypeOf(z.string());
  expect(Object.getOwnPropertyDescriptor(proto, "description")?.enumerable).toBe(false);
  expect(Object.getOwnPropertyDescriptor(proto, "_def")?.enumerable).toBe(false);

  const keys: string[] = [];
  for (const k in z.string()) keys.push(k);
  expect(keys).toEqual(["def", "type", "format", "minLength", "maxLength"]);
});

test("a live member is not cached per instance", () => {
  const schema = z.string();

  expect(schema.description).toBe(undefined);
  core.globalRegistry.add(schema, { description: "later" });
  expect(schema.description).toBe("later");
  expect(Object.prototype.hasOwnProperty.call(schema, "description")).toBe(false);
});

test("constructing through a subclass does not strip the base prototype", () => {
  // `super(def)` gives `this` a prototype of `new.target.prototype`, so a constructor can complete a construction without having built its own prototype.
  const MyString: new (def: { type: "string" }) => z.ZodString = class extends (z.ZodString as any) {} as any;
  new MyString({ type: "string" });

  const plain = z.string();
  expect(plain.parse("x")).toBe("x");
  expect(typeof plain.email).toBe("function");
  expect(typeof new MyString({ type: "string" }).email).toBe("function");
});

test("a subclass's own members survive the install", () => {
  // The members go on the prototype of the constructor that built the instance, so a subclass's own prototype keeps what it declared. `z.symbol()` is constructed nowhere else here, which puts the subclass before its base — the ordering the install has to get right. Asserted rather than assumed, so warming it elsewhere fails the test instead of hollowing it out.
  expect(Object.prototype.hasOwnProperty.call((z.ZodSymbol as any).prototype, "parse")).toBe(false);
  const First = class extends (z.ZodSymbol as any) {
    parse() {
      return "PARSE";
    }
    optional() {
      return "OPTIONAL";
    }
  } as any;
  const first = new First({ type: "symbol" });
  expect(first.parse(Symbol())).toBe("PARSE");
  expect(first.optional()).toBe("OPTIONAL");
  const sym = Symbol();
  expect(z.symbol().parse(sym)).toBe(sym);

  // and the other way round, with the base prototype already built by one of the `z.number()` calls above. Asserted for the same reason: warm it nowhere and this block quietly becomes a second copy of the cold case.
  expect(Object.prototype.hasOwnProperty.call((z.ZodNumber as any).prototype, "parse")).toBe(true);
  const Second = class extends (z.ZodNumber as any) {
    parse() {
      return "SECOND";
    }
  } as any;
  expect(new Second({ type: "number" }).parse(1)).toBe("SECOND");

  // two levels deep: neither prototype takes a copy, so the inherited member is one function
  const Third = class extends (Second as any) {} as any;
  new Third({ type: "number" });
  expect(Second.prototype.parse).toBe(Third.prototype.parse);
});

test("a hand-written getter member accepts assignment", () => {
  // Every member was an accessor with a setter before they moved onto `proto`, so a getter written by hand needs one too.
  const schema: any = z.string();
  schema.spa = () => "SPA";
  schema.toJSONSchema = () => "JSON";
  expect(schema.spa()).toBe("SPA");
  expect(schema.toJSONSchema()).toBe("JSON");

  const mini: any = zm.string();
  mini.with = () => "WITH";
  expect(mini.with()).toBe("WITH");
});

test("shape is lazy and stays out of Object.keys", () => {
  const schema = z.object({ a: z.string() });

  expect(Object.prototype.hasOwnProperty.call(schema, "shape")).toEqual(false);
  expect("shape" in schema).toEqual(true);
  expect(Object.keys(schema)).not.toContain("shape");
  expect({ ...schema }).not.toHaveProperty("shape");

  expect(Object.keys(schema.shape)).toEqual(["a"]);

  // Reading caches a non-enumerable own data property. An own accessor here would put every later object schema into V8 dictionary mode.
  expect(Object.prototype.hasOwnProperty.call(schema, "shape")).toEqual(true);
  expect(Object.getOwnPropertyDescriptor(schema, "shape")).toMatchObject({
    writable: true,
    enumerable: false,
    configurable: true,
  });
  expect(Object.keys(schema)).not.toContain("shape");

  const mini = zm.object({ a: zm.string() });
  expect(Object.prototype.hasOwnProperty.call(mini, "shape")).toEqual(false);
  expect(Object.keys(mini.shape)).toEqual(["a"]);
  expect(Object.keys(mini)).not.toContain("shape");
});

test("shape accepts repeated assignment and recomputes after deletion", () => {
  const schema: any = z.object({ a: z.string() });

  schema.shape = { b: z.number() };
  expect(Object.keys(schema.shape)).toEqual(["b"]);
  // The cached property stays writable, so a second assignment does not throw in strict mode.
  schema.shape = { c: z.boolean() };
  expect(Object.keys(schema.shape)).toEqual(["c"]);

  // Deleting clears the memo rather than removing the property, since the accessor lives on the prototype.
  delete schema.shape;
  expect(Object.keys(schema.shape)).toEqual(["a"]);
});

test("a self-referential shape getter breaks the cycle instead of recursing", () => {
  const Self: any = z.object({
    a: z.string(),
    get b() {
      return z.array(z.object(Self.shape));
    },
  });
  expect(Object.keys(Self.shape)).toEqual(["a", "b"]);

  const Mini: any = zm.object({
    a: zm.string(),
    get b() {
      return zm.array(zm.object(Mini.shape));
    },
  });
  expect(Object.keys(Mini.shape)).toEqual(["a", "b"]);
});
