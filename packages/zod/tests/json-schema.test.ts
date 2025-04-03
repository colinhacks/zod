import { toJSONSchema } from "@zod/core";
import { describe, expect, it } from "vitest";
import * as z from "zod";

describe("toJSONSchema", () => {
  it("primitive types", () => {
    expect(toJSONSchema(z.string())).toMatchInlineSnapshot(`
      {
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.number())).toMatchInlineSnapshot(`
      {
        "type": "number",
      }
    `);
    expect(toJSONSchema(z.boolean())).toMatchInlineSnapshot(`
      {
        "type": "boolean",
      }
    `);
    expect(toJSONSchema(z.null())).toMatchInlineSnapshot(`
      {
        "type": "null",
      }
    `);
    expect(toJSONSchema(z.undefined())).toMatchInlineSnapshot(`
      {
        "type": "null",
      }
    `);
    expect(toJSONSchema(z.any())).toMatchInlineSnapshot(`{}`);
    expect(toJSONSchema(z.unknown())).toMatchInlineSnapshot(`{}`);
    expect(toJSONSchema(z.never())).toMatchInlineSnapshot(`
      {
        "not": {},
      }
    `);
    expect(toJSONSchema(z.email())).toMatchInlineSnapshot(`
      {
        "format": "email",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.datetime())).toMatchInlineSnapshot(`
      {
        "format": "date-time",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.date())).toMatchInlineSnapshot(`
      {
        "format": "date",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.time())).toMatchInlineSnapshot(`
      {
        "format": "time",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.duration())).toMatchInlineSnapshot(`
      {
        "format": "duration",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.ipv4())).toMatchInlineSnapshot(`
      {
        "format": "ipv4",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.ipv6())).toMatchInlineSnapshot(`
      {
        "format": "ipv6",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.uuid())).toMatchInlineSnapshot(`
      {
        "format": "uuid",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.guid())).toMatchInlineSnapshot(`
      {
        "format": "uuid",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.url())).toMatchInlineSnapshot(`
      {
        "format": "uri",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.base64())).toMatchInlineSnapshot(`
      {
        "contentEncoding": "base64",
        "pattern": /\\^\\(\\[0-9a-zA-Z\\+/\\]\\{4\\}\\)\\*\\(\\(\\[0-9a-zA-Z\\+/\\]\\{2\\}==\\)\\|\\(\\[0-9a-zA-Z\\+/\\]\\{3\\}=\\)\\)\\?\\$/,
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.cuid())).toMatchInlineSnapshot(`
      {
        "pattern": /\\^\\[cC\\]\\[\\^\\\\s-\\]\\{8,\\}\\$/,
        "type": "string",
      }
    `);
    // expect(toJSONSchema(z.regex(/asdf/))).toMatchInlineSnapshot();
    expect(toJSONSchema(z.emoji())).toMatchInlineSnapshot(`
      {
        "pattern": /\\^\\(\\\\p\\{Extended_Pictographic\\}\\|\\\\p\\{Emoji_Component\\}\\)\\+\\$/u,
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.nanoid())).toMatchInlineSnapshot(`
      {
        "pattern": /\\^\\[a-zA-Z0-9_-\\]\\{21\\}\\$/,
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.cuid2())).toMatchInlineSnapshot(`
      {
        "pattern": /\\^\\[0-9a-z\\]\\+\\$/,
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.ulid())).toMatchInlineSnapshot(`
      {
        "pattern": /\\^\\[0-9A-HJKMNP-TV-Z\\]\\{26\\}\\$/,
        "type": "string",
      }
    `);
    // expect(toJSONSchema(z.cidr())).toMatchInlineSnapshot();
    expect(toJSONSchema(z.number())).toMatchInlineSnapshot(`
      {
        "type": "number",
      }
    `);
    expect(toJSONSchema(z.int())).toMatchInlineSnapshot(`
      {
        "exclusiveMaximum": 9007199254740991,
        "exclusiveMinimum": -9007199254740991,
        "type": "integer",
      }
    `);
    expect(toJSONSchema(z.int32())).toMatchInlineSnapshot(`
      {
        "exclusiveMaximum": 2147483647,
        "exclusiveMinimum": -2147483648,
        "type": "integer",
      }
    `);
    expect(toJSONSchema(z.float32())).toMatchInlineSnapshot(`
      {
        "exclusiveMaximum": 3.4028234663852886e+38,
        "exclusiveMinimum": -3.4028234663852886e+38,
        "type": "number",
      }
    `);
    expect(toJSONSchema(z.float64())).toMatchInlineSnapshot(`
      {
        "exclusiveMaximum": 1.7976931348623157e+308,
        "exclusiveMinimum": -1.7976931348623157e+308,
        "type": "number",
      }
    `);
    expect(toJSONSchema(z.jwt())).toMatchInlineSnapshot(`
      {
        "type": "string",
      }
    `);
  });

  it("unsupported schema types", () => {
    expect(() => toJSONSchema(z.bigint())).toThrow("BigInt cannot be represented in JSON Schema");
    expect(() => toJSONSchema(z.int64())).toThrow("BigInt cannot be represented in JSON Schema");
    expect(() => toJSONSchema(z.symbol())).toThrow("Symbols cannot be represented in JSON Schema");
    expect(() => toJSONSchema(z.void())).toThrow("Void cannot be represented in JSON Schema");
    expect(() => toJSONSchema(z.date())).toThrow("Date cannot be represented in JSON Schema");
    expect(() => toJSONSchema(z.map(z.string(), z.number()))).toThrow("Map cannot be represented in JSON Schema");
    expect(() => toJSONSchema(z.set(z.string()))).toThrow("Set cannot be represented in JSON Schema");
    expect(() => toJSONSchema(z.custom(() => true))).toThrow("Custom types cannot be represented in JSON Schema");

    // File type
    const fileSchema = z.file();
    expect(() => toJSONSchema(fileSchema)).toThrow("File cannot be represented in JSON Schema");

    // Transform
    const transformSchema = z.string().transform((val) => Number.parseInt(val));
    expect(() => toJSONSchema(transformSchema)).toThrow("Transforms cannot be represented in JSON Schema");

    // Static catch values
    const staticCatchSchema = z.string().catch(() => "sup");
    expect(toJSONSchema(staticCatchSchema)).toMatchInlineSnapshot(`
      {
        "else": {
          "const": "sup",
        },
        "if": {
          "type": "string",
        },
        "then": {
          "type": "string",
        },
      }
    `);

    // Dynamic catch values
    const dynamicCatchSchema = z.string().catch((ctx) => `${ctx.issues.length}`);
    expect(() => toJSONSchema(dynamicCatchSchema)).toThrow("Dynamic catch values are not supported in JSON Schema");
  });

  it("string formats", () => {
    expect(toJSONSchema(z.string().email())).toMatchInlineSnapshot(`
      {
        "format": "email",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.string().uuid())).toMatchInlineSnapshot(`
      {
        "format": "uuid",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.datetime())).toMatchInlineSnapshot(`
      {
        "format": "date-time",
        "type": "string",
      }
    `);

    expect(toJSONSchema(z.iso.date())).toMatchInlineSnapshot(`
      {
        "format": "date",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.time())).toMatchInlineSnapshot(`
      {
        "format": "time",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.duration())).toMatchInlineSnapshot(`
      {
        "format": "duration",
        "type": "string",
      }
    `);
    // expect(toJSONSchema(z.string().ip())).toMatchInlineSnapshot(`
    //   {
    //     "pattern": /\\(\\^\\(\\?:\\(\\?:25\\[0-5\\]\\|2\\[0-4\\]\\[0-9\\]\\|1\\[0-9\\]\\[0-9\\]\\|\\[1-9\\]\\[0-9\\]\\|\\[0-9\\]\\)\\\\\\.\\)\\{3\\}\\(\\?:25\\[0-5\\]\\|2\\[0-4\\]\\[0-9\\]\\|1\\[0-9\\]\\[0-9\\]\\|\\[1-9\\]\\[0-9\\]\\|\\[0-9\\]\\)\\$\\)\\|\\(\\^\\(\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{7\\}\\|::\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,6\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{1\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,5\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{2\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,4\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{3\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,3\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{4\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,2\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{5\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,1\\}\\)\\(\\[a-fA-F0-9\\]\\{1,4\\}\\|\\(\\(\\(25\\[0-5\\]\\)\\|\\(2\\[0-4\\]\\[0-9\\]\\)\\|\\(1\\[0-9\\]\\{2\\}\\)\\|\\(\\[0-9\\]\\{1,2\\}\\)\\)\\\\\\.\\)\\{3\\}\\(\\(25\\[0-5\\]\\)\\|\\(2\\[0-4\\]\\[0-9\\]\\)\\|\\(1\\[0-9\\]\\{2\\}\\)\\|\\(\\[0-9\\]\\{1,2\\}\\)\\)\\)\\$\\)/,
    //     "type": "string",
    //   }
    // `);
    expect(toJSONSchema(z.ipv4())).toMatchInlineSnapshot(`
      {
        "format": "ipv4",
        "type": "string",
      }
    `);

    expect(toJSONSchema(z.ipv6())).toMatchInlineSnapshot(`
      {
        "format": "ipv6",
        "type": "string",
      }
    `);

    expect(toJSONSchema(z.base64())).toMatchInlineSnapshot(`
      {
        "contentEncoding": "base64",
        "pattern": /\\^\\(\\[0-9a-zA-Z\\+/\\]\\{4\\}\\)\\*\\(\\(\\[0-9a-zA-Z\\+/\\]\\{2\\}==\\)\\|\\(\\[0-9a-zA-Z\\+/\\]\\{3\\}=\\)\\)\\?\\$/,
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.url())).toMatchInlineSnapshot(`
      {
        "format": "uri",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.guid())).toMatchInlineSnapshot(`
      {
        "format": "uuid",
        "type": "string",
      }
    `);
  });

  it("number constraints", () => {
    expect(toJSONSchema(z.number().min(5).max(10))).toMatchInlineSnapshot(
      `
      {
        "maximum": 10,
        "minimum": 5,
        "type": "number",
      }
    `
    );
  });

  it("arrays", () => {
    expect(toJSONSchema(z.array(z.string()))).toMatchInlineSnapshot(`
      {
        "items": {
          "type": "string",
        },
        "type": "array",
      }
    `);
  });

  it("unions", () => {
    const schema = z.union([z.string(), z.number()]);
    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "oneOf": [
          {
            "type": "string",
          },
          {
            "type": "number",
          },
        ],
      }
    `);
  });

  it("intersections", () => {
    const schema = z.intersection(z.object({ name: z.string() }), z.object({ age: z.number() }));

    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "allOf": [
          {
            "properties": {
              "name": {
                "type": "string",
              },
            },
            "required": [
              "name",
            ],
            "type": "object",
          },
          {
            "properties": {
              "age": {
                "type": "number",
              },
            },
            "required": [
              "age",
            ],
            "type": "object",
          },
        ],
      }
    `);
  });

  it("record", () => {
    const schema = z.record(z.string(), z.boolean());
    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "additionalProperties": {
          "type": "boolean",
        },
        "propertyNames": {
          "type": "string",
        },
        "type": "object",
      }
    `);
  });

  it("tuple", () => {
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());
    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "items": {
          "type": "boolean",
        },
        "prefixItems": [
          {
            "type": "string",
          },
          {
            "type": "number",
          },
        ],
        "type": "array",
      }
    `);
  });

  it("promise", () => {
    const schema = z.promise(z.string());
    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "type": "string",
      }
    `);
  });

  it("lazy", () => {
    const schema = z.lazy(() => z.string());
    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "type": "string",
      }
    `);
  });

  // enum
  it("enum", () => {
    const schema = z.enum(["a", "b", "c"]);
    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "enum": [
          "a",
          "b",
          "c",
        ],
      }
    `);
  });

  // literal
  it("literal", () => {
    const a = z.literal("hello");
    expect(toJSONSchema(a)).toMatchInlineSnapshot(`
      {
        "enum": [
          "hello",
        ],
      }
    `);

    const b = z.literal(["hello", undefined, null, 5, BigInt(1324)]);
    expect(() => toJSONSchema(b)).toThrow();

    const c = z.literal(["hello", null, 5]);
    expect(toJSONSchema(c)).toMatchInlineSnapshot(`
      {
        "enum": [
          "hello",
          null,
          5,
        ],
      }
    `);
  });

  // pipe
  it("pipe", () => {
    const schema = z
      .string()
      .transform((val) => Number.parseInt(val))
      .pipe(z.number());
    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "type": "number",
      }
    `);
  });

  it("simple objects", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    expect(toJSONSchema(schema)).toMatchInlineSnapshot(
      `
      {
        "properties": {
          "age": {
            "type": "number",
          },
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
          "age",
        ],
        "type": "object",
      }
    `
    );
  });

  it("catchall objects", () => {
    const a = z.strictObject({
      name: z.string(),
      age: z.number(),
    });

    expect(toJSONSchema(a)).toMatchInlineSnapshot(`
      {
        "additionalProperties": {
          "not": {},
        },
        "properties": {
          "age": {
            "type": "number",
          },
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
          "age",
        ],
        "type": "object",
      }
    `);

    const b = z
      .object({
        name: z.string(),
      })
      .catchall(z.string());

    expect(toJSONSchema(b)).toMatchInlineSnapshot(`
      {
        "additionalProperties": {
          "type": "string",
        },
        "properties": {
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
        ],
        "type": "object",
      }
    `);

    const c = z.looseObject({
      name: z.string(),
    });

    expect(toJSONSchema(c)).toMatchInlineSnapshot(`
      {
        "additionalProperties": {},
        "properties": {
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
        ],
        "type": "object",
      }
    `);
  });

  it("optional fields - object", () => {
    const schema = z.object({
      required: z.string(),
      optional: z.string().optional(),
    });

    const result = toJSONSchema(schema);

    expect(result).toMatchInlineSnapshot(`
      {
        "properties": {
          "optional": {
            "oneOf": [
              {
                "type": "string",
              },
              {
                "type": "null",
              },
            ],
          },
          "required": {
            "type": "string",
          },
        },
        "required": [
          "required",
        ],
        "type": "object",
      }
    `);
  });

  it("recursive object", () => {
    interface Category {
      name: string;
      subcategories: Category[];
    }

    const categorySchema: z.ZodType<Category> = z.object({
      name: z.string(),
      subcategories: z.array(z.lazy(() => categorySchema)),
    });

    const result = toJSONSchema(categorySchema);
    expect(result).toMatchInlineSnapshot(`
      {
        "$defs": {
          "schema_0": {
            "properties": {
              "name": {
                "type": "string",
              },
              "subcategories": {
                "items": {
                  "$ref": "#/$defs/schema_0",
                },
                "type": "array",
              },
            },
            "required": [
              "name",
              "subcategories",
            ],
            "type": "object",
          },
        },
        "$ref": "#/$defs/schema_0",
      }
    `);
  });

  it("simple interface", () => {
    const userSchema = z.interface({
      name: z.string(),
      "age?": z.number(),
      "?email": z.string(),
    });

    const result = toJSONSchema(userSchema);
    expect(result).toMatchInlineSnapshot(`
      {
        "properties": {
          "age": {
            "type": "number",
          },
          "email": {
            "type": "string",
          },
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
          "email",
        ],
        "type": "object",
      }
    `);
  });

  it("catchall interface", () => {
    const a = z.strictInterface({
      name: z.string(),
      age: z.number(),
    });

    expect(toJSONSchema(a)).toMatchInlineSnapshot(`
      {
        "additionalProperties": {
          "not": {},
        },
        "properties": {
          "age": {
            "type": "number",
          },
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
          "age",
        ],
        "type": "object",
      }
    `);

    const b = z
      .interface({
        name: z.string(),
      })
      .catchall(z.string());

    expect(toJSONSchema(b)).toMatchInlineSnapshot(`
      {
        "additionalProperties": {
          "type": "string",
        },
        "properties": {
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
        ],
        "type": "object",
      }
    `);

    const c = z.looseInterface({
      name: z.string(),
    });

    expect(toJSONSchema(c)).toMatchInlineSnapshot(`
      {
        "additionalProperties": {},
        "properties": {
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
        ],
        "type": "object",
      }
    `);
  });

  it("recursive interface schemas", () => {
    const TreeNodeSchema = z.interface({
      id: z.string(),
      get children() {
        return TreeNodeSchema;
      },
    });

    const result = toJSONSchema(TreeNodeSchema);

    // Should have definitions for recursive schema
    expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
      `
      "{
        "$defs": {
          "schema_0": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "children": {
                "$ref": "#/$defs/schema_0"
              }
            },
            "required": [
              "id",
              "children"
            ]
          }
        },
        "$ref": "#/$defs/schema_0"
      }"
    `
    );
  });

  it("mutually recursive interface schemas", () => {
    const FolderSchema = z.interface({
      name: z.string(),
      get files() {
        return z.array(FileSchema);
      },
    });

    const FileSchema = z.interface({
      name: z.string(),
      get parent() {
        return FolderSchema;
      },
    });

    const result = toJSONSchema(FolderSchema);

    // Should have definitions for both schemas
    expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
      `
      "{
        "$defs": {
          "schema_0": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "files": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "parent": {
                      "$ref": "#/$defs/schema_0"
                    }
                  },
                  "required": [
                    "name",
                    "parent"
                  ]
                }
              }
            },
            "required": [
              "name",
              "files"
            ]
          }
        },
        "$ref": "#/$defs/schema_0"
      }"
    `
    );
  });
});
