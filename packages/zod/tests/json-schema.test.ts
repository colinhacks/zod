import { toJSONSchema } from "@zod/core";
import { beforeAll, describe, expect, test } from "vitest";
import * as z from "zod";

describe("toJSONSchema", () => {
  test("primitive types", () => {
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
        "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.datetime())).toMatchInlineSnapshot(`
      {
        "format": "date-time",
        "pattern": "^((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))T([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(\\.\\d+)?(Z)$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.date())).toMatchInlineSnapshot(`
      {
        "format": "date",
        "pattern": "^((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.time())).toMatchInlineSnapshot(`
      {
        "format": "time",
        "pattern": "^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(\\.\\d+)?$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.duration())).toMatchInlineSnapshot(`
      {
        "format": "duration",
        "pattern": "^P(?:(\\d+W)|(?!.*W)(?=\\d|T\\d)(\\d+Y)?(\\d+M)?(\\d+D)?(T(?=\\d)(\\d+H)?(\\d+M)?(\\d+([.,]\\d+)?S)?)?)$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.ipv4())).toMatchInlineSnapshot(`
      {
        "format": "ipv4",
        "pattern": "^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.ipv6())).toMatchInlineSnapshot(`
      {
        "format": "ipv6",
        "pattern": "^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.uuid())).toMatchInlineSnapshot(`
      {
        "format": "uuid",
        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.guid())).toMatchInlineSnapshot(`
      {
        "format": "uuid",
        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$",
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
        "format": "base64",
        "pattern": "^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.cuid())).toMatchInlineSnapshot(`
      {
        "format": "cuid",
        "pattern": "^[cC][^\\s-]{8,}$",
        "type": "string",
      }
    `);
    // expect(toJSONSchema(z.regex(/asdf/))).toMatchInlineSnapshot();
    expect(toJSONSchema(z.emoji())).toMatchInlineSnapshot(`
      {
        "format": "emoji",
        "pattern": "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.nanoid())).toMatchInlineSnapshot(`
      {
        "format": "nanoid",
        "pattern": "^[a-zA-Z0-9_-]{21}$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.cuid2())).toMatchInlineSnapshot(`
      {
        "format": "cuid2",
        "pattern": "^[0-9a-z]+$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.ulid())).toMatchInlineSnapshot(`
      {
        "format": "ulid",
        "pattern": "^[0-9A-HJKMNP-TV-Z]{26}$",
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
        "format": "jwt",
        "type": "string",
      }
    `);
  });

  test("unsupported schema types", () => {
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
        "default": "sup",
        "type": "string",
      }
    `);

    // Dynamic catch values
    const dynamicCatchSchema = z.string().catch((ctx) => `${ctx.issues.length}`);
    expect(() => toJSONSchema(dynamicCatchSchema)).toThrow("Dynamic catch values are not supported in JSON Schema");
  });

  test("string formats", () => {
    expect(toJSONSchema(z.string().email())).toMatchInlineSnapshot(`
      {
        "format": "email",
        "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.string().uuid())).toMatchInlineSnapshot(`
      {
        "format": "uuid",
        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.datetime())).toMatchInlineSnapshot(`
      {
        "format": "date-time",
        "pattern": "^((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))T([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(\\.\\d+)?(Z)$",
        "type": "string",
      }
    `);

    expect(toJSONSchema(z.iso.date())).toMatchInlineSnapshot(`
      {
        "format": "date",
        "pattern": "^((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.time())).toMatchInlineSnapshot(`
      {
        "format": "time",
        "pattern": "^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(\\.\\d+)?$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.iso.duration())).toMatchInlineSnapshot(`
      {
        "format": "duration",
        "pattern": "^P(?:(\\d+W)|(?!.*W)(?=\\d|T\\d)(\\d+Y)?(\\d+M)?(\\d+D)?(T(?=\\d)(\\d+H)?(\\d+M)?(\\d+([.,]\\d+)?S)?)?)$",
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
        "pattern": "^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$",
        "type": "string",
      }
    `);

    expect(toJSONSchema(z.ipv6())).toMatchInlineSnapshot(`
      {
        "format": "ipv6",
        "pattern": "^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$",
        "type": "string",
      }
    `);

    expect(toJSONSchema(z.base64())).toMatchInlineSnapshot(`
      {
        "contentEncoding": "base64",
        "format": "base64",
        "pattern": "^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$",
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
        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$",
        "type": "string",
      }
    `);
    expect(toJSONSchema(z.string().regex(/asdf/))).toMatchInlineSnapshot(`
      {
        "format": "regex",
        "pattern": "asdf",
        "type": "string",
      }
    `);
  });

  test("number constraints", () => {
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

  test("arrays", () => {
    expect(toJSONSchema(z.array(z.string()))).toMatchInlineSnapshot(`
      {
        "items": {
          "type": "string",
        },
        "type": "array",
      }
    `);
  });

  test("unions", () => {
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

  test("intersections", () => {
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

  test("record", () => {
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

  test("tuple", () => {
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

  test("promise", () => {
    const schema = z.promise(z.string());
    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "type": "string",
      }
    `);
  });

  test("lazy", () => {
    const schema = z.lazy(() => z.string());
    expect(toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "type": "string",
      }
    `);
  });

  // enum
  test("enum", () => {
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
  test("literal", () => {
    const a = z.literal("hello");
    expect(toJSONSchema(a)).toMatchInlineSnapshot(`
      {
        "const": "hello",
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
  test("pipe", () => {
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

  test("simple objects", () => {
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

  test("catchall objects", () => {
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

  test("optional fields - object", () => {
    const schema = z.object({
      required: z.string(),
      optional: z.string().optional(),
      nonoptional: z.string().optional().nonoptional(),
    });

    const result = toJSONSchema(schema);

    expect(result).toMatchInlineSnapshot(`
      {
        "properties": {
          "nonoptional": {
            "type": "string",
          },
          "optional": {
            "type": "string",
          },
          "required": {
            "type": "string",
          },
        },
        "required": [
          "required",
          "nonoptional",
        ],
        "type": "object",
      }
    `);
  });

  test("recursive object", () => {
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
        "properties": {
          "name": {
            "type": "string",
          },
          "subcategories": {
            "items": {
              "$ref": "#",
            },
            "type": "array",
          },
        },
        "required": [
          "name",
          "subcategories",
        ],
        "type": "object",
      }
    `);
  });

  test("simple interface", () => {
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

  test("catchall interface", () => {
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

  test("recursive interface schemas", () => {
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
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "children": {
            "$ref": "#"
          }
        },
        "required": [
          "id",
          "children"
        ]
      }"
    `
    );
  });

  test("mutually recursive interface schemas", () => {
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
                  "$ref": "#"
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
      }"
    `
    );
  });
});

describe("toJSONSchema params", () => {
  describe("reused", () => {
    const reusedRegistry = z.registry<{ id?: string }>();

    const InternalA = z.object({ str: z.string() });
    const InternalB = z.object({ str: z.string() });
    const InternalC = z.object({ str: z.string() });

    const External = z.object({
      intA1: InternalA,
      intA2: InternalA,
      intB1: InternalB,
      intB2: InternalB,
      intC: InternalC,
    });

    beforeAll(() => {
      reusedRegistry.add(InternalA, { id: "internalA" });
      reusedRegistry.add(InternalC, { id: "internalC" });
    });

    test("inline (without registry)", () => {
      const result = toJSONSchema(External, { reused: "inline" });

      expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
        `
        "{
          "type": "object",
          "properties": {
            "intA1": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intA2": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intB1": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intB2": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intC": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            }
          },
          "required": [
            "intA1",
            "intA2",
            "intB1",
            "intB2",
            "intC"
          ]
        }"
      `
      );
    });

    test("inline (with registry)", () => {
      const result = toJSONSchema(External, { metadata: reusedRegistry, reused: "inline" });

      expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
        `
        "{
          "type": "object",
          "properties": {
            "intA1": {
              "id": "internalA",
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intA2": {
              "id": "internalA",
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intB1": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intB2": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intC": {
              "id": "internalC",
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            }
          },
          "required": [
            "intA1",
            "intA2",
            "intB1",
            "intB2",
            "intC"
          ]
        }"
      `
      );
    });

    test("ref (without registry)", () => {
      const result = toJSONSchema(External, { reused: "ref" });

      expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
        `
        "{
          "type": "object",
          "properties": {
            "intA1": {
              "$ref": "#/$defs/__schema0"
            },
            "intA2": {
              "$ref": "#/$defs/__schema0"
            },
            "intB1": {
              "$ref": "#/$defs/__schema1"
            },
            "intB2": {
              "$ref": "#/$defs/__schema1"
            },
            "intC": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            }
          },
          "required": [
            "intA1",
            "intA2",
            "intB1",
            "intB2",
            "intC"
          ],
          "$defs": {
            "__schema0": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "__schema1": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            }
          }
        }"
      `
      );
    });

    test("ref (with registry)", () => {
      const result = toJSONSchema(External, { metadata: reusedRegistry, reused: "ref" });

      expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
        `
        "{
          "type": "object",
          "properties": {
            "intA1": {
              "$ref": "#/$defs/internalA"
            },
            "intA2": {
              "$ref": "#/$defs/internalA"
            },
            "intB1": {
              "$ref": "#/$defs/__schema0"
            },
            "intB2": {
              "$ref": "#/$defs/__schema0"
            },
            "intC": {
              "id": "internalC",
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            }
          },
          "required": [
            "intA1",
            "intA2",
            "intB1",
            "intB2",
            "intC"
          ],
          "$defs": {
            "internalA": {
              "id": "internalA",
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "__schema0": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            }
          }
        }"
      `
      );
    });

    test("ref-registry (without registry)", () => {
      const result = toJSONSchema(External, { reused: "ref-registry" });

      expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
        `
        "{
          "type": "object",
          "properties": {
            "intA1": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intA2": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intB1": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intB2": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intC": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            }
          },
          "required": [
            "intA1",
            "intA2",
            "intB1",
            "intB2",
            "intC"
          ]
        }"
      `
      );
    });

    test("ref-registry (with registry)", () => {
      const result = toJSONSchema(External, { metadata: reusedRegistry, reused: "ref-registry" });

      expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
        `
        "{
          "type": "object",
          "properties": {
            "intA1": {
              "$ref": "#/$defs/internalA"
            },
            "intA2": {
              "$ref": "#/$defs/internalA"
            },
            "intB1": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intB2": {
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "intC": {
              "$ref": "#/$defs/internalC"
            }
          },
          "required": [
            "intA1",
            "intA2",
            "intB1",
            "intB2",
            "intC"
          ],
          "$defs": {
            "internalA": {
              "id": "internalA",
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            },
            "internalC": {
              "id": "internalC",
              "type": "object",
              "properties": {
                "str": {
                  "type": "string"
                }
              },
              "required": [
                "str"
              ]
            }
          }
        }"
      `
      );
    });
  });
});

test("override", () => {
  const schema = z.toJSONSchema(z.string(), {
    override: (ctx) => {
      ctx.zodSchema;
      ctx.jsonSchema;
      ctx.jsonSchema.whatever = "sup";
    },
  });
  expect(schema).toMatchInlineSnapshot(`
    {
      "type": "string",
      "whatever": "sup",
    }
  `);
});

test("pipe", () => {
  const mySchema = z
    .string()
    .transform((val) => val.length)
    .pipe(z.number());
  // ZodPipe

  const a = z.toJSONSchema(mySchema);
  expect(a).toMatchInlineSnapshot(`
    {
      "type": "number",
    }
  `);
  // => { type: "number" }

  const b = z.toJSONSchema(mySchema, { pipes: "input" });
  expect(b).toMatchInlineSnapshot(`
    {
      "type": "string",
    }
  `);
  // => { type: "string" }
});

test("passthrough schemas", () => {
  const Internal = z.object({
    num: z.number(),
    str: z.string(),
  });
  //.meta({ id: "Internal" });

  const External = z.object({
    a: Internal,
    b: Internal.optional(),
    c: z.lazy(() => Internal),
    d: z.promise(Internal),
    e: z.pipe(Internal, Internal),
  });

  const result = z.toJSONSchema(External, {
    reused: "ref",
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "$defs": {
        "__schema0": {
          "properties": {
            "num": {
              "type": "number",
            },
            "str": {
              "type": "string",
            },
          },
          "required": [
            "num",
            "str",
          ],
          "type": "object",
        },
      },
      "properties": {
        "a": {
          "$ref": "#/$defs/__schema0",
        },
        "b": {
          "$ref": "#/$defs/__schema0",
        },
        "c": {
          "$ref": "#/$defs/__schema0",
        },
        "d": {
          "$ref": "#/$defs/__schema0",
        },
        "e": {
          "$ref": "#/$defs/__schema0",
        },
      },
      "required": [
        "a",
        "c",
        "d",
        "e",
      ],
      "type": "object",
    }
  `);
});
