import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

declare const iss: z.core.$ZodIssueCode;

const Test = z.object({
  f1: z.number(),
  f2: z.string().optional(),
  f3: z.string().nullable(),
  f4: z.array(z.object({ t: z.union([z.string(), z.boolean()]) })),
});
// type TestFlattenedErrors = core.inferFlattenedErrors<typeof Test, { message: string; code: number }>;
// type TestFormErrors = core.inferFlattenedErrors<typeof Test>;
const parsed = Test.safeParse({});

test("regular error", () => {
  expect(parsed).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "expected": "number",
        "code": "invalid_type",
        "path": [
          "f1"
        ],
        "message": "Invalid input: expected number, received undefined"
      },
      {
        "expected": "string",
        "code": "invalid_type",
        "path": [
          "f3"
        ],
        "message": "Invalid input: expected string, received undefined"
      },
      {
        "expected": "array",
        "code": "invalid_type",
        "path": [
          "f4"
        ],
        "message": "Invalid input: expected array, received undefined"
      }
    ]],
      "success": false,
    }
  `);
});

test(".flatten()", () => {
  const flattened = parsed.error!.flatten();
  // flattened.
  expectTypeOf(flattened).toMatchTypeOf<{
    formErrors: string[];
    fieldErrors: {
      f2?: string[];
      f1?: string[];
      f3?: string[];
      f4?: string[];
    };
  }>();

  expect(flattened).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "f1": [
          "Invalid input: expected number, received undefined",
        ],
        "f3": [
          "Invalid input: expected string, received undefined",
        ],
        "f4": [
          "Invalid input: expected array, received undefined",
        ],
      },
      "formErrors": [],
    }
  `);
});

test("custom .flatten()", () => {
  type ErrorType = { message: string; code: number };
  const flattened = parsed.error!.flatten((iss) => ({
    message: iss.message,
    code: 1234,
  }));
  expectTypeOf(flattened).toMatchTypeOf<{
    formErrors: ErrorType[];
    fieldErrors: {
      f2?: ErrorType[];
      f1?: ErrorType[];
      f3?: ErrorType[];
      f4?: ErrorType[];
    };
  }>();

  expect(flattened).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "f1": [
          {
            "code": 1234,
            "message": "Invalid input: expected number, received undefined",
          },
        ],
        "f3": [
          {
            "code": 1234,
            "message": "Invalid input: expected string, received undefined",
          },
        ],
        "f4": [
          {
            "code": 1234,
            "message": "Invalid input: expected array, received undefined",
          },
        ],
      },
      "formErrors": [],
    }
  `);
});

test(".format()", () => {
  const formatted = parsed.error!.format();
  expectTypeOf(formatted).toMatchTypeOf<{
    _errors: string[];
    f2?: { _errors: string[] };
    f1?: { _errors: string[] };
    f3?: { _errors: string[] };
    f4?: {
      [x: number]: {
        _errors: string[];
        t?: {
          _errors: string[];
        };
      };
      _errors: string[];
    };
  }>();

  expect(formatted).toMatchInlineSnapshot(`
    {
      "_errors": [],
      "f1": {
        "_errors": [
          "Invalid input: expected number, received undefined",
        ],
      },
      "f3": {
        "_errors": [
          "Invalid input: expected string, received undefined",
        ],
      },
      "f4": {
        "_errors": [
          "Invalid input: expected array, received undefined",
        ],
      },
    }
  `);
});

test("custom .format()", () => {
  type ErrorType = { message: string; code: number };
  const formatted = parsed.error!.format((iss) => ({
    message: iss.message,
    code: 1234,
  }));
  expectTypeOf(formatted).toMatchTypeOf<{
    _errors: ErrorType[];
    f2?: { _errors: ErrorType[] };
    f1?: { _errors: ErrorType[] };
    f3?: { _errors: ErrorType[] };
    f4?: {
      [x: number]: {
        _errors: ErrorType[];
        t?: {
          _errors: ErrorType[];
        };
      };
      _errors: ErrorType[];
    };
  }>();

  expect(formatted).toMatchInlineSnapshot(`
    {
      "_errors": [],
      "f1": {
        "_errors": [
          {
            "code": 1234,
            "message": "Invalid input: expected number, received undefined",
          },
        ],
      },
      "f3": {
        "_errors": [
          {
            "code": 1234,
            "message": "Invalid input: expected string, received undefined",
          },
        ],
      },
      "f4": {
        "_errors": [
          {
            "code": 1234,
            "message": "Invalid input: expected array, received undefined",
          },
        ],
      },
    }
  `);
});

test("all errors", () => {
  const propertySchema = z.string();
  const schema = z
    .object({
      a: propertySchema,
      b: propertySchema,
    })
    .refine(
      (val) => {
        return val.a === val.b;
      },
      { message: "Must be equal" }
    );

  const r1 = schema.safeParse({
    a: "asdf",
    b: "qwer",
  });

  expect(z.core.flattenError(r1.error!)).toEqual({
    formErrors: ["Must be equal"],
    fieldErrors: {},
  });

  const r2 = schema.safeParse({
    a: null,
    b: null,
  });

  // const error = _error as z.ZodError;
  expect(z.core.flattenError(r2.error!)).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "a": [
          "Invalid input: expected string, received null",
        ],
        "b": [
          "Invalid input: expected string, received null",
        ],
      },
      "formErrors": [],
    }
  `);

  expect(z.core.flattenError(r2.error!, (iss) => iss.message.toUpperCase())).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "a": [
          "INVALID INPUT: EXPECTED STRING, RECEIVED NULL",
        ],
        "b": [
          "INVALID INPUT: EXPECTED STRING, RECEIVED NULL",
        ],
      },
      "formErrors": [],
    }
  `);
  // Test identity

  expect(z.core.flattenError(r2.error!, (i: z.ZodIssue) => i)).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "a": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received null",
            "path": [
              "a",
            ],
          },
        ],
        "b": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received null",
            "path": [
              "b",
            ],
          },
        ],
      },
      "formErrors": [],
    }
  `);

  // Test mapping
  const f1 = z.core.flattenError(r2.error!, (i: z.ZodIssue) => i.message.length);
  expect(f1).toMatchInlineSnapshot(`
    {
      "fieldErrors": {
        "a": [
          45,
        ],
        "b": [
          45,
        ],
      },
      "formErrors": [],
    }
  `);
  // expect(f1.fieldErrors.a![0]).toEqual("Invalid input: expected string".length);
  // expect(f1).toMatchObject({
  //   formErrors: [],
  //   fieldErrors: {
  //     a: ["Invalid input: expected string".length],
  //     b: ["Invalid input: expected string".length],
  //   },
  // });
});

const schema = z.strictObject({
  username: z.string().brand<"username">(),
  favoriteNumbers: z.array(z.number()),
  nesting: z.object({
    a: z.string(),
  }),
});
const result = schema.safeParse({
  username: 1234,
  favoriteNumbers: [1234, "4567"],
  nesting: {
    a: 123,
  },
  extra: 1234,
});

const tree = z.treeifyError(result.error!);

expectTypeOf(tree).toEqualTypeOf<{
  errors: string[];
  properties?: {
    username?: {
      errors: string[];
    };
    favoriteNumbers?: {
      errors: string[];
      items?: {
        errors: string[];
      }[];
    };
    nesting?: {
      errors: string[];
      properties?: {
        a?: {
          errors: string[];
        };
      };
    };
  };
}>();

test("z.treeifyError", () => {
  expect(tree).toMatchInlineSnapshot(`
    {
      "errors": [
        "Unrecognized key: "extra"",
      ],
      "properties": {
        "favoriteNumbers": {
          "errors": [],
          "items": [
            ,
            {
              "errors": [
                "Invalid input: expected number, received string",
              ],
            },
          ],
        },
        "nesting": {
          "errors": [],
          "properties": {
            "a": {
              "errors": [
                "Invalid input: expected string, received number",
              ],
            },
          },
        },
        "username": {
          "errors": [
            "Invalid input: expected string, received number",
          ],
        },
      },
    }
  `);
});

test("z.treeifyError 2", () => {
  const schema = z.strictObject({
    name: z.string(),
    logLevel: z.union([z.string(), z.number()]),
    env: z.literal(["production", "development"]),
  });

  const data = {
    name: 1000,
    logLevel: false,
    extra: 1000,
  };

  const result = schema.safeParse(data);
  const err = z.treeifyError(result.error!);
  expect(err).toMatchInlineSnapshot(`
    {
      "errors": [
        "Unrecognized key: "extra"",
      ],
      "properties": {
        "env": {
          "errors": [
            "Invalid option: expected one of "production"|"development"",
          ],
        },
        "logLevel": {
          "errors": [
            "Invalid input: expected string, received boolean",
            "Invalid input: expected number, received boolean",
          ],
        },
        "name": {
          "errors": [
            "Invalid input: expected string, received number",
          ],
        },
      },
    }
  `);
});

test("z.prettifyError", () => {
  expect(z.prettifyError(result.error!)).toMatchInlineSnapshot(`
    "✖ Unrecognized key: "extra"
    ✖ Invalid input: expected string, received number
      → at username
    ✖ Invalid input: expected number, received string
      → at favoriteNumbers[1]
    ✖ Invalid input: expected string, received number
      → at nesting.a"
  `);
});

test("z.toDotPath", () => {
  expect(z.core.toDotPath(["a", "b", 0, "c"])).toMatchInlineSnapshot(`"a.b[0].c"`);

  expect(z.core.toDotPath(["a", Symbol("b"), 0, "c"])).toMatchInlineSnapshot(`"a["Symbol(b)"][0].c"`);

  // Test with periods in keys
  expect(z.core.toDotPath(["user.name", "first.last"])).toMatchInlineSnapshot(`"["user.name"]["first.last"]"`);

  // Test with special characters
  expect(z.core.toDotPath(["user", "$special", Symbol("#symbol")])).toMatchInlineSnapshot(
    `"user.$special["Symbol(#symbol)"]"`
  );

  // Test with dots and quotes
  expect(z.core.toDotPath(["search", `query("foo.bar"="abc")`])).toMatchInlineSnapshot(
    `"search["query(\\"foo.bar\\"=\\"abc\\")"]"`
  );

  // Test with newlines
  expect(z.core.toDotPath(["search", `foo\nbar`])).toMatchInlineSnapshot(`"search["foo\\nbar"]"`);

  // Test with empty strings
  expect(z.core.toDotPath(["", "empty"])).toMatchInlineSnapshot(`".empty"`);

  // Test with array indices
  expect(z.core.toDotPath(["items", 0, 1, 2])).toMatchInlineSnapshot(`"items[0][1][2]"`);

  // Test with mixed path elements
  expect(z.core.toDotPath(["users", "user.config", 0, "settings.theme"])).toMatchInlineSnapshot(
    `"users["user.config"][0]["settings.theme"]"`
  );

  // Test with square brackets in keys
  expect(z.core.toDotPath(["data[0]", "value"])).toMatchInlineSnapshot(`"["data[0]"].value"`);

  // Test with empty path
  expect(z.core.toDotPath([])).toMatchInlineSnapshot(`""`);
});

test("inheritance", () => {
  const e1 = new z.ZodError([]);
  expect(e1).toBeInstanceOf(z.core.$ZodError);
  expect(e1).toBeInstanceOf(z.ZodError);
  // expect(e1).not.toBeInstanceOf(Error);

  const e2 = new z.ZodRealError([]);
  expect(e2).toBeInstanceOf(z.ZodError);
  expect(e2).toBeInstanceOf(z.ZodRealError);
  expect(e2).toBeInstanceOf(Error);
});

test("disc union treeify/format", () => {
  const schema = z.discriminatedUnion(
    "foo",
    [
      z.object({
        foo: z.literal("x"),
        x: z.string(),
      }),
      z.object({
        foo: z.literal("y"),
        y: z.string(),
      }),
    ],
    {
      error: "Invalid discriminator",
    }
  );

  const error = schema.safeParse({ foo: "invalid" }).error;
  expect(z.treeifyError(error!)).toMatchInlineSnapshot(`
    {
      "errors": [],
      "properties": {
        "foo": {
          "errors": [
            "Invalid discriminator",
          ],
        },
      },
    }
  `);
  expect(z.prettifyError(error!)).toMatchInlineSnapshot(`
    "✖ Invalid discriminator
      → at foo"
  `);
  expect(z.formatError(error!)).toMatchInlineSnapshot(`
    {
      "_errors": [],
      "foo": {
        "_errors": [
          "Invalid discriminator",
        ],
      },
    }
  `);
});

test("update message after adding issues", () => {
  const e = new z.ZodError([]);
  e.addIssue({
    code: "custom",
    message: "message",
    input: "asdf",
    path: [],
  });
  expect(e.message).toMatchInlineSnapshot(`
    "[
      {
        "code": "custom",
        "message": "message",
        "input": "asdf",
        "path": []
      }
    ]"
  `);

  e.addIssue({
    code: "custom",
    message: "message",
    input: "asdf",
    path: [],
  });
  expect(e.message).toMatchInlineSnapshot(`
    "[
      {
        "code": "custom",
        "message": "message",
        "input": "asdf",
        "path": []
      },
      {
        "code": "custom",
        "message": "message",
        "input": "asdf",
        "path": []
      }
    ]"
  `);
});

test("z.formatError nested union preserves parent path", () => {
  const syntheticError = new z.ZodError([
    {
      code: "invalid_union",
      path: ["parent"],
      message: "Invalid input",
      errors: [
        [
          {
            code: "invalid_type",
            expected: "string",
            path: [],
            message: "Expected string",
            input: {},
          },
        ],
        [
          {
            code: "invalid_union",
            path: ["child"],
            message: "Invalid input",
            errors: [
              [
                {
                  code: "invalid_type",
                  expected: "string",
                  path: [],
                  message: "Expected string",
                  input: true,
                },
              ],
              [
                {
                  code: "invalid_type",
                  expected: "number",
                  path: [],
                  message: "Expected number",
                  input: true,
                },
              ],
            ],
          },
        ],
      ],
    },
  ] as any);

  const formatted: any = z.formatError(syntheticError);

  // "child" must be nested under "parent", not at root
  expect(formatted).not.toHaveProperty("child");
  expect(formatted).toHaveProperty("parent");
  expect(formatted.parent).toHaveProperty("child");
  expect(formatted.parent.child._errors).toContain("Expected string");
  expect(formatted.parent.child._errors).toContain("Expected number");
  expect(formatted.parent._errors).toContain("Expected string");
});
test("z.treeifyError nested union preserves parent path", () => {
  // When a nested invalid_union appears inside another invalid_union,
  // the inner errors must stay nested under their parent path, not flatten to root.
  const syntheticError = new z.ZodError([
    {
      code: "invalid_union",
      path: ["parent"],
      message: "Invalid input",
      errors: [
        [
          {
            code: "invalid_type",
            expected: "string",
            path: [],
            message: "Expected string",
            input: {},
          },
        ],
        [
          {
            code: "invalid_union",
            path: ["child"],
            message: "Invalid input",
            errors: [
              [
                {
                  code: "invalid_type",
                  expected: "string",
                  path: [],
                  message: "Expected string",
                  input: true,
                },
              ],
              [
                {
                  code: "invalid_type",
                  expected: "number",
                  path: [],
                  message: "Expected number",
                  input: true,
                },
              ],
            ],
          },
        ],
      ],
    },
  ] as any);

  const tree: any = z.treeifyError(syntheticError);

  // "child" must be nested under "parent", not at root
  expect(tree.properties).not.toHaveProperty("child");
  expect(tree.properties).toHaveProperty("parent");
  expect(tree.properties.parent.properties).toHaveProperty("child");
  expect(tree.properties.parent.properties.child.errors).toContain("Expected string");
  expect(tree.properties.parent.properties.child.errors).toContain("Expected number");
  expect(tree.properties.parent.errors).toContain("Expected string");
});

test("z.treeifyError deeply nested union (4 levels) preserves full path", () => {
  // a > b > c > d — each level wrapped in an invalid_union
  const syntheticError = new z.ZodError([
    {
      code: "invalid_union",
      path: ["a"],
      message: "Invalid input",
      errors: [
        [
          {
            code: "invalid_union",
            path: ["b"],
            message: "Invalid input",
            errors: [
              [
                {
                  code: "invalid_union",
                  path: ["c"],
                  message: "Invalid input",
                  errors: [
                    [
                      {
                        code: "invalid_type",
                        expected: "string",
                        path: ["d"],
                        message: "Expected string",
                        input: 123,
                      },
                    ],
                  ],
                },
              ],
            ],
          },
        ],
      ],
    },
  ] as any);

  const tree: any = z.treeifyError(syntheticError);

  // The full path must be preserved: a.b.c.d
  expect(tree.properties).toHaveProperty("a");
  expect(tree.properties).not.toHaveProperty("b");
  expect(tree.properties).not.toHaveProperty("c");

  const lvlA = tree.properties.a;
  expect(lvlA.properties).toHaveProperty("b");

  const lvlB = lvlA.properties.b;
  expect(lvlB.properties).toHaveProperty("c");

  const lvlC = lvlB.properties.c;
  expect(lvlC.properties).toHaveProperty("d");
  expect(lvlC.properties.d.errors).toContain("Expected string");
});

test("z.treeifyError nested union with real schema", () => {
  const innerUnion = z.union([
    z.object({ type: z.literal("a"), value: z.string() }),
    z.object({ type: z.literal("b"), value: z.number() }),
  ]);

  const schema = z.string().or(
    z.object({
      settings: z.object({ name: z.string() }).and(innerUnion),
    })
  );

  const result = schema.safeParse({
    settings: { name: 123, type: "x", value: true },
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    const tree: any = z.treeifyError(result.error);

    // All settings-related errors should be under "settings", not at root
    expect(tree.properties).toHaveProperty("settings");
    const settingsProperties = tree.properties.settings.properties ?? {};
    for (const key of Object.keys(settingsProperties)) {
      // Every sub-property under settings should NOT also appear at root
      if (key !== "settings") {
        expect(tree.properties).not.toHaveProperty(key);
      }
    }
  }
});

const prototypePropertyNames = ["__proto__", "constructor", "toString", "hasOwnProperty", "valueOf"] as const;

test.each(prototypePropertyNames)("z.formatError handles Object.prototype property path: %s", (name) => {
  const schema = z.object({ data: z.string() }).superRefine((_, ctx) => {
    ctx.addIssue({ code: "custom", message: "invalid value", path: [name] });
  });
  const result = schema.safeParse({ data: "hello" });
  expect(result.success).toBe(false);
  const formatted = z.formatError(result.error!);
  expect(Object.prototype.hasOwnProperty.call(formatted, name)).toBe(true);
  expect(Object.getPrototypeOf(formatted)).toBe(Object.prototype);
  expect((formatted as any)[name]._errors).toEqual(["invalid value"]);
});

test.each(prototypePropertyNames)("z.treeifyError handles Object.prototype property path: %s", (name) => {
  const schema = z.object({ data: z.string() }).superRefine((_, ctx) => {
    ctx.addIssue({ code: "custom", message: "invalid value", path: [name] });
  });
  const result = schema.safeParse({ data: "hello" });
  expect(result.success).toBe(false);
  const tree = z.treeifyError(result.error!);
  expect(Object.prototype.hasOwnProperty.call(tree.properties, name)).toBe(true);
  expect(Object.getPrototypeOf(tree.properties)).toBe(Object.prototype);
  expect((tree as any).properties[name].errors).toEqual(["invalid value"]);
});

test.each(prototypePropertyNames)("z.flattenError handles Object.prototype property path: %s", (name) => {
  const schema = z.object({ data: z.string() }).superRefine((_, ctx) => {
    ctx.addIssue({ code: "custom", message: "invalid value", path: [name] });
  });
  const result = schema.safeParse({ data: "hello" });
  expect(result.success).toBe(false);
  const { fieldErrors } = z.flattenError(result.error!);
  expect(Object.prototype.hasOwnProperty.call(fieldErrors, name)).toBe(true);
  expect(Object.getPrototypeOf(fieldErrors)).toBe(Object.prototype);
  expect((fieldErrors as any)[name]).toEqual(["invalid value"]);
});

/** The "__proto__" node must be a real own data property, not the inherited accessor. */
const protoNode = (obj: any) => Object.getOwnPropertyDescriptor(obj, "__proto__")!.value;

test("error formatters merge sibling issues under a __proto__ path", () => {
  const schema = z.string().check((ctx) => {
    ctx.issues.push({ code: "custom", message: "a", path: ["__proto__", "x"], input: ctx.value });
    ctx.issues.push({ code: "custom", message: "b", path: ["__proto__", "y"], input: ctx.value });
  });
  const error = schema.safeParse("hello").error!;

  const formatted = protoNode(z.formatError(error));
  expect(formatted.x._errors).toEqual(["a"]);
  expect(formatted.y._errors).toEqual(["b"]);

  const tree = protoNode((z.treeifyError(error) as any).properties);
  expect(tree.properties.x.errors).toEqual(["a"]);
  expect(tree.properties.y.errors).toEqual(["b"]);

  expect(({} as any).x).toBeUndefined();
  expect(({} as any).y).toBeUndefined();
});

test("error formatting leaves Object.prototype untouched for input-derived keys", () => {
  const record = z.record(z.string(), z.string()).safeParse(JSON.parse('{"toString": 1}'));
  expect(record.success).toBe(false);
  expect((z.formatError(record.error!) as any).toString._errors).toHaveLength(1);

  const entries = new Map(Object.entries(JSON.parse('{"__proto__": {"pwn": 1}}')));
  const result = z.map(z.string(), z.object({ pwn: z.string() })).safeParse(entries);
  expect(result.success).toBe(false);
  expect(protoNode(z.formatError(result.error!)).pwn._errors).toHaveLength(1);
  expect(protoNode((z.treeifyError(result.error!) as any).properties).properties.pwn.errors).toHaveLength(1);
  expect(({} as any).pwn).toBeUndefined();
});

test("formatError handles an input-derived _errors path", () => {
  const schema = z.object({ parent: z.record(z.string(), z.string()) });
  const result = schema.safeParse({ parent: { _errors: 1 } });
  expect(result.success).toBe(false);

  const formatted = z.formatError(result.error!);
  expect(formatted.parent?._errors).toEqual(["Invalid input: expected string, received number"]);

  const nested = z
    .object({ parent: z.record(z.string(), z.object({ child: z.string() })) })
    .safeParse({ parent: { _errors: { child: 1 } } });
  expect(nested.success).toBe(false);
  expect((z.formatError(nested.error!) as any).parent.child._errors).toEqual([
    "Invalid input: expected string, received number",
  ]);
});

test("error walkers handle path elements named after inherited methods", () => {
  // "toString" and "constructor" are truthy on the prototype, so a plain lookup finds
  // the inherited function instead of creating a node, and the push then throws.
  for (const [schema, input] of [
    [z.object({ toString: z.string() }), { toString: 1 }],
    [z.object({ constructor: z.string() }), { constructor: 1 }],
    [z.object({ toString: z.string(), constructor: z.string() }), { toString: 1, constructor: 2 }],
  ] as const) {
    const result = (schema as any).safeParse(input);
    expect(result.success).toBe(false);

    const formatted = z.formatError(result.error) as any;
    const tree = z.treeifyError(result.error) as any;
    for (const key of Object.keys(input)) {
      expect(formatted[key]._errors).toHaveLength(1);
      expect(tree.properties[key].errors).toHaveLength(1);
      expect(Object.prototype.hasOwnProperty.call(formatted, key)).toBe(true);
    }
  }
});
