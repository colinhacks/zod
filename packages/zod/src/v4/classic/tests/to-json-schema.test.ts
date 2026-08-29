import { Validator } from "@seriousme/openapi-schema-validator";
import { describe, expect, test } from "vitest";
import * as z from "zod";
// import * as zCore from "zod/v4/core";

const openAPI30Validator = new Validator();
/** @see https://github.com/colinhacks/zod/issues/5147 */
const validateOpenAPI30Schema = async (zodJSONSchema: Record<string, unknown>): Promise<true> => {
  const res = await openAPI30Validator.validate({
    openapi: "3.0.0",
    info: {
      title: "SampleApi",
      description: "Sample backend service",
      version: "1.0.0",
    },
    components: { schemas: { test: zodJSONSchema } },
    paths: {},
  });

  if (!res.valid) {
    // `console.error` should make `vitest` trow an unhandled error printing the validation messages in consoles
    console.error(
      `OpenAPI schema is not valid against ${openAPI30Validator.version}`,
      JSON.stringify(res.errors, null, 2)
    );
  }

  return true;
};

describe("toJSONSchema", () => {
  test("primitive types", () => {
    expect(z.toJSONSchema(z.string())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.number())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.boolean())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "boolean",
      }
    `);
    expect(z.toJSONSchema(z.null())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "null",
      }
    `);
    expect(z.toJSONSchema(z.undefined(), { unrepresentable: "any" })).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
      }
    `);
    expect(z.toJSONSchema(z.any())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
      }
    `);
    expect(z.toJSONSchema(z.unknown())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
      }
    `);
    expect(z.toJSONSchema(z.never())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "not": {},
      }
    `);
    expect(z.toJSONSchema(z.email())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "email",
        "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.iso.datetime())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "date-time",
        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z))$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.iso.date())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "date",
        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$",
        "type": "string",
      }
    `);
    // only shapes keeping both an offset and seconds may advertise `date-time`, composed onto a string as well as constructed
    expect(z.toJSONSchema(z.iso.datetime()).format).toEqual("date-time");
    expect(z.toJSONSchema(z.iso.datetime({ offset: true })).format).toEqual("date-time");
    expect(z.toJSONSchema(z.iso.datetime({ precision: 0 })).format).toEqual("date-time");
    expect(z.toJSONSchema(z.iso.datetime({ local: true })).format).toEqual(undefined);
    expect(z.toJSONSchema(z.iso.datetime({ precision: -1 })).format).toEqual(undefined);
    expect(z.toJSONSchema(z.string().check(z.iso.datetime({ local: true }))).format).toEqual(undefined);
    expect(z.toJSONSchema(z.string().check(z.iso.datetime())).format).toEqual("date-time");
    // the pattern still describes what the schema accepts
    expect(z.toJSONSchema(z.iso.datetime({ local: true })).pattern).toBeDefined();

    expect(z.toJSONSchema(z.iso.time())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "pattern": "^(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.iso.time({ precision: -1 }))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "pattern": "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.iso.time({ precision: 0 }))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "pattern": "^(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.iso.time({ precision: 3 }))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "pattern": "^(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{3}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.iso.duration())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "duration",
        "pattern": "^P(?:(\\d+W)|(?!.*W)(?=\\d|T\\d)(\\d+Y)?(\\d+M)?(\\d+D)?(T(?=\\d)(\\d+H)?(\\d+M)?(\\d+([.,]\\d+)?S)?)?)$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.ipv4())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "ipv4",
        "pattern": "^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.ipv6())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "ipv6",
        "pattern": "^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.mac())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "mac",
        "pattern": "^(?:[0-9A-F]{2}:){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}:){5}[0-9a-f]{2}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.mac({ delimiter: ":" }))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "mac",
        "pattern": "^(?:[0-9A-F]{2}:){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}:){5}[0-9a-f]{2}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.mac({ delimiter: "-" }))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "mac",
        "pattern": "^(?:[0-9A-F]{2}-){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}-){5}[0-9a-f]{2}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.uuid())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "uuid",
        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.guid())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "uuid",
        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.url())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "uri",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.base64())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "contentEncoding": "base64",
        "format": "base64",
        "pattern": "^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.cuid())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "cuid",
        "pattern": "^[cC][0-9a-z]{6,}$",
        "type": "string",
      }
    `);
    // expect(z.toJSONSchema(z.regex(/asdf/))).toMatchInlineSnapshot();
    expect(z.toJSONSchema(z.emoji())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "emoji",
        "pattern": "^[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.nanoid())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "nanoid",
        "pattern": "^[a-zA-Z0-9_-]{21}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.nanoid({ length: 64 }))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "nanoid",
        "pattern": "^[a-zA-Z0-9_-]{64}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.cuid2())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "cuid2",
        "pattern": "^[0-9a-z]+$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.ulid())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "ulid",
        "pattern": "^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$",
        "type": "string",
      }
    `);
    // expect(z.toJSONSchema(z.cidr())).toMatchInlineSnapshot();
    expect(z.toJSONSchema(z.number())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.int())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "maximum": 9007199254740991,
        "minimum": -9007199254740991,
        "type": "integer",
      }
    `);
    expect(z.toJSONSchema(z.int32())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "maximum": 2147483647,
        "minimum": -2147483648,
        "type": "integer",
      }
    `);
    expect(z.toJSONSchema(z.float32())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "maximum": 3.4028234663852886e+38,
        "minimum": -3.4028234663852886e+38,
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.float64())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "maximum": 1.7976931348623157e+308,
        "minimum": -1.7976931348623157e+308,
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.jwt())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "jwt",
        "type": "string",
      }
    `);
  });

  test("unsupported schema types", () => {
    expect(() => z.toJSONSchema(z.bigint())).toThrow("BigInt cannot be represented in JSON Schema");
    expect(() => z.toJSONSchema(z.int64())).toThrow("BigInt cannot be represented in JSON Schema");
    expect(() => z.toJSONSchema(z.symbol())).toThrow("Symbols cannot be represented in JSON Schema");
    expect(() => z.toJSONSchema(z.void())).toThrow("Void cannot be represented in JSON Schema");
    expect(() => z.toJSONSchema(z.undefined())).toThrow("Undefined cannot be represented in JSON Schema");
    expect(() => z.toJSONSchema(z.date())).toThrow("Date cannot be represented in JSON Schema");
    expect(() => z.toJSONSchema(z.map(z.string(), z.number()))).toThrow("Map cannot be represented in JSON Schema");
    expect(() => z.toJSONSchema(z.set(z.string()))).toThrow("Set cannot be represented in JSON Schema");
    expect(() => z.toJSONSchema(z.custom(() => true))).toThrow("Custom types cannot be represented in JSON Schema");

    // Transform
    const transformSchema = z.string().transform((val) => Number.parseInt(val));
    expect(() => z.toJSONSchema(transformSchema)).toThrow("Transforms cannot be represented in JSON Schema");

    // Static catch values
    const staticCatchSchema = z.string().catch(() => "sup");
    expect(z.toJSONSchema(staticCatchSchema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "default": "sup",
        "type": "string",
      }
    `);

    // Dynamic catch values
    const dynamicCatchSchema = z.string().catch((ctx) => `${ctx.issues.length}`);
    expect(() => z.toJSONSchema(dynamicCatchSchema)).toThrow("Dynamic catch values are not supported in JSON Schema");
    expect(z.toJSONSchema(dynamicCatchSchema, { unrepresentable: "any" })).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "string",
      }
    `);
  });

  test("string formats", () => {
    expect(z.toJSONSchema(z.string().email())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "email",
        "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.string().uuid())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "uuid",
        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.iso.datetime())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "date-time",
        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z))$",
        "type": "string",
      }
    `);

    expect(z.toJSONSchema(z.iso.date())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "date",
        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.iso.time())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "pattern": "^(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.iso.duration())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "duration",
        "pattern": "^P(?:(\\d+W)|(?!.*W)(?=\\d|T\\d)(\\d+Y)?(\\d+M)?(\\d+D)?(T(?=\\d)(\\d+H)?(\\d+M)?(\\d+([.,]\\d+)?S)?)?)$",
        "type": "string",
      }
    `);
    // expect(z.toJSONSchema(z.string().ip())).toMatchInlineSnapshot(`
    //   {
    //     "pattern": /\\(\\^\\(\\?:\\(\\?:25\\[0-5\\]\\|2\\[0-4\\]\\[0-9\\]\\|1\\[0-9\\]\\[0-9\\]\\|\\[1-9\\]\\[0-9\\]\\|\\[0-9\\]\\)\\\\\\.\\)\\{3\\}\\(\\?:25\\[0-5\\]\\|2\\[0-4\\]\\[0-9\\]\\|1\\[0-9\\]\\[0-9\\]\\|\\[1-9\\]\\[0-9\\]\\|\\[0-9\\]\\)\\$\\)\\|\\(\\^\\(\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{7\\}\\|::\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,6\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{1\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,5\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{2\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,4\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{3\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,3\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{4\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,2\\}\\|\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{5\\}:\\(\\[a-fA-F0-9\\]\\{1,4\\}:\\)\\{0,1\\}\\)\\(\\[a-fA-F0-9\\]\\{1,4\\}\\|\\(\\(\\(25\\[0-5\\]\\)\\|\\(2\\[0-4\\]\\[0-9\\]\\)\\|\\(1\\[0-9\\]\\{2\\}\\)\\|\\(\\[0-9\\]\\{1,2\\}\\)\\)\\\\\\.\\)\\{3\\}\\(\\(25\\[0-5\\]\\)\\|\\(2\\[0-4\\]\\[0-9\\]\\)\\|\\(1\\[0-9\\]\\{2\\}\\)\\|\\(\\[0-9\\]\\{1,2\\}\\)\\)\\)\\$\\)/,
    //     "type": "string",
    //   }
    // `);
    expect(z.toJSONSchema(z.ipv4())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "ipv4",
        "pattern": "^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$",
        "type": "string",
      }
    `);

    expect(z.toJSONSchema(z.ipv6())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "ipv6",
        "pattern": "^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$",
        "type": "string",
      }
    `);

    expect(z.toJSONSchema(z.mac())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "mac",
        "pattern": "^(?:[0-9A-F]{2}:){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}:){5}[0-9a-f]{2}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.mac({ delimiter: ":" }))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "mac",
        "pattern": "^(?:[0-9A-F]{2}:){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}:){5}[0-9a-f]{2}$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.mac({ delimiter: "-" }))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "mac",
        "pattern": "^(?:[0-9A-F]{2}-){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}-){5}[0-9a-f]{2}$",
        "type": "string",
      }
    `);

    expect(z.toJSONSchema(z.base64())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "contentEncoding": "base64",
        "format": "base64",
        "pattern": "^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.url())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "uri",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.guid())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "uuid",
        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.string().regex(/asdf/))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "pattern": "asdf",
        "type": "string",
      }
    `);
  });

  test("string patterns", () => {
    expect(
      z.toJSONSchema(
        z
          .string()
          .startsWith("hello")
          .includes("cruel")
          .includes("dark", { position: 10 })
          .endsWith("world")
          .regex(/stuff/)
      )
    ).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "allOf": [
          {
            "pattern": "^hello.*",
          },
          {
            "pattern": "cruel",
          },
          {
            "pattern": "^.{10,}dark",
          },
          {
            "pattern": ".*world$",
          },
          {
            "pattern": "stuff",
          },
        ],
        "type": "string",
      }
    `);

    expect(
      z.toJSONSchema(
        z
          .string()
          .startsWith("hello")
          .includes("cruel")
          .includes("dark", { position: 10 })
          .endsWith("world")
          .regex(/stuff/),
        {
          target: "draft-7",
        }
      )
    ).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "allOf": [
          {
            "pattern": "^hello.*",
            "type": "string",
          },
          {
            "pattern": "cruel",
            "type": "string",
          },
          {
            "pattern": "^.{10,}dark",
            "type": "string",
          },
          {
            "pattern": ".*world$",
            "type": "string",
          },
          {
            "pattern": "stuff",
            "type": "string",
          },
        ],
        "type": "string",
      }
    `);
  });

  test("includes with position emits a pattern matching runtime semantics", () => {
    // String.prototype.includes(sub, position) matches `sub` at `position` OR
    // LATER, so the JSON Schema pattern must allow >= position leading chars.
    const schema = z.string().includes("foo", { position: 2 });
    const json = z.toJSONSchema(schema) as { pattern?: string };
    expect(json.pattern).toBe("^.{2,}foo");

    const re = new RegExp(json.pattern!);
    for (const input of ["xxfoo", "xxxfoo", "xfoo", "ab"]) {
      expect(re.test(input)).toBe(schema.safeParse(input).success);
    }
  });

  test("number constraints", () => {
    expect(z.toJSONSchema(z.number().min(5).max(10))).toMatchInlineSnapshot(
      `
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "maximum": 10,
        "minimum": 5,
        "type": "number",
      }
    `
    );

    expect(z.toJSONSchema(z.number().gt(5).gt(10))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "exclusiveMinimum": 10,
        "type": "number",
      }
    `);

    expect(z.toJSONSchema(z.number().gt(5).gte(10))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "minimum": 10,
        "type": "number",
      }
    `);

    expect(z.toJSONSchema(z.number().lt(5).lt(3))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "exclusiveMaximum": 3,
        "type": "number",
      }
    `);

    expect(z.toJSONSchema(z.number().lt(5).lt(3).lte(2))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "maximum": 2,
        "type": "number",
      }
    `);

    expect(z.toJSONSchema(z.number().lt(5).lte(3))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "maximum": 3,
        "type": "number",
      }
    `);

    expect(z.toJSONSchema(z.number().gt(5).lt(10))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "exclusiveMaximum": 10,
        "exclusiveMinimum": 5,
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.number().gte(5).lte(10))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "maximum": 10,
        "minimum": 5,
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.number().positive())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "exclusiveMinimum": 0,
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.number().negative())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "exclusiveMaximum": 0,
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.number().nonpositive())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "maximum": 0,
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.number().nonnegative())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "minimum": 0,
        "type": "number",
      }
    `);
  });

  test("number constraints draft-4", () => {
    expect(z.toJSONSchema(z.number().gt(5).lt(10), { target: "draft-4" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "exclusiveMaximum": true,
        "exclusiveMinimum": true,
        "maximum": 10,
        "minimum": 5,
        "type": "number",
      }
    `);
  });

  test("number constraints intersection draft-04", () => {
    // When both minimum (from .int()) and exclusiveMinimum (from .positive()) exist, the more restrictive constraint should be used
    expect(z.toJSONSchema(z.number().int().positive().lte(65535), { target: "draft-04" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "exclusiveMinimum": true,
        "maximum": 65535,
        "minimum": 0,
        "type": "integer",
      }
    `);
    // Same for openapi-3.0
    expect(z.toJSONSchema(z.number().int().positive().lte(65535), { target: "openapi-3.0" })).toMatchInlineSnapshot(`
      {
        "exclusiveMinimum": true,
        "maximum": 65535,
        "minimum": 0,
        "type": "integer",
      }
    `);
    // When inclusive minimum is more restrictive than exclusive minimum
    expect(z.toJSONSchema(z.number().gt(3).gte(10), { target: "draft-04" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "minimum": 10,
        "type": "number",
      }
    `);
    // Same logic for maximum constraints
    expect(z.toJSONSchema(z.number().int().negative(), { target: "draft-04" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "exclusiveMaximum": true,
        "maximum": 0,
        "minimum": -9007199254740991,
        "type": "integer",
      }
    `);
  });

  test("target normalization draft-04 and draft-07", () => {
    // Test that both old (draft-4, draft-7) and new (draft-04, draft-07) target formats work

    // Test draft-04 / draft-4
    expect(z.toJSONSchema(z.number().gt(5), { target: "draft-04" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "exclusiveMinimum": true,
        "minimum": 5,
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.number().gt(5), { target: "draft-4" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "exclusiveMinimum": true,
        "minimum": 5,
        "type": "number",
      }
    `);
    // Test draft-07 / draft-7
    expect(z.toJSONSchema(z.number().gt(5), { target: "draft-07" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "exclusiveMinimum": 5,
        "type": "number",
      }
    `);
    expect(z.toJSONSchema(z.number().gt(5), { target: "draft-7" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "exclusiveMinimum": 5,
        "type": "number",
      }
    `);
  });

  test("nullable openapi-3.0", () => {
    const schema = z.string().nullable();
    const jsonSchema = z.toJSONSchema(schema, { target: "openapi-3.0" });
    validateOpenAPI30Schema(jsonSchema);
    expect(jsonSchema).toMatchInlineSnapshot(`
      {
        "nullable": true,
        "type": "string",
      }
    `);
  });

  test("union with null openapi-3.0", () => {
    const schema = z.union([z.string(), z.null()]);
    const jsonSchema = z.toJSONSchema(schema, { target: "openapi-3.0" });
    validateOpenAPI30Schema(jsonSchema);
    expect(jsonSchema).toMatchInlineSnapshot(`
      {
        "anyOf": [
          {
            "type": "string",
          },
          {
            "enum": [
              null,
            ],
            "nullable": true,
            "type": "string",
          },
        ],
      }
    `);
  });

  test("number with exclusive min-max openapi-3.0", () => {
    const schema = z.number().lt(100).gt(1);
    const jsonSchema = z.toJSONSchema(schema, { target: "openapi-3.0" });
    validateOpenAPI30Schema(jsonSchema);
    expect(jsonSchema).toMatchInlineSnapshot(`
      {
        "exclusiveMaximum": true,
        "exclusiveMinimum": true,
        "maximum": 100,
        "minimum": 1,
        "type": "number",
      }
    `);
  });

  test("arrays", () => {
    expect(z.toJSONSchema(z.array(z.string()))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "items": {
          "type": "string",
        },
        "type": "array",
      }
    `);
  });

  test("unions", () => {
    const schema = z.union([z.string(), z.number()]);
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": [
          "string",
          "number",
        ],
      }
    `);
  });

  test("nullable compacts to a type array", () => {
    expect(z.toJSONSchema(z.string().nullable())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": [
          "string",
          "null",
        ],
      }
    `);

    // a nested union folds into the outer type array rather than leaving a mixed shape
    expect(z.toJSONSchema(z.union([z.string(), z.number()]).nullable())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": [
          "string",
          "number",
          "null",
        ],
      }
    `);

    // the null branch is bare but the object branch is not, so this stays an anyOf
    expect(z.toJSONSchema(z.object({ a: z.string() }).nullable())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "anyOf": [
          {
            "additionalProperties": false,
            "properties": {
              "a": {
                "type": "string",
              },
            },
            "required": [
              "a",
            ],
            "type": "object",
          },
          {
            "type": "null",
          },
        ],
      }
    `);
  });

  test("duplicate branches dedupe, single branch stays a bare type", () => {
    // a `type` array must have unique members, so two branches that erase to the same bare type collapse
    const refined = z.union([z.string().refine((s) => s.length > 2), z.string().refine((s) => s.length < 9)]);
    expect(z.toJSONSchema(refined)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "string",
      }
    `);
    expect(z.toJSONSchema(z.union([z.string()]))).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "string",
      }
    `);
  });

  test("compaction runs after overrides and ref extraction", () => {
    // an override decorates the string branch, so it is no longer a bare type and must survive in anyOf
    const decorated = z.toJSONSchema(z.union([z.string(), z.number()]), {
      override(ctx) {
        if (ctx.zodSchema._zod.def.type === "string") ctx.jsonSchema.whatever = "sup";
      },
    });
    expect(decorated).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "anyOf": [
          {
            "type": "string",
            "whatever": "sup",
          },
          {
            "type": "number",
          },
        ],
      }
    `);

    // a branch extracted into $defs is a $ref, not a bare type, so `reused` is not silently bypassed
    const shared = z.string();
    expect(
      z.toJSONSchema(z.object({ a: shared, b: z.union([shared, z.null()]) }), { reused: "ref" })
    ).toMatchInlineSnapshot(`
      {
        "$defs": {
          "__schema0": {
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "a": {
            "$ref": "#/$defs/__schema0",
          },
          "b": {
            "anyOf": [
              {
                "$ref": "#/$defs/__schema0",
              },
              {
                "type": "null",
              },
            ],
          },
        },
        "required": [
          "a",
          "b",
        ],
        "type": "object",
      }
    `);
  });

  test("openapi-3.0 keeps a single-string type", () => {
    // OpenAPI 3.0 has no type arrays; nullability is spelled with `nullable`
    expect(z.toJSONSchema(z.string().nullable(), { target: "openapi-3.0" })).toMatchInlineSnapshot(`
      {
        "nullable": true,
        "type": "string",
      }
    `);
  });

  test("union with constrained branch is not compacted", () => {
    const schema = z.union([z.string().min(1), z.number()]);
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "anyOf": [
          {
            "minLength": 1,
            "type": "string",
          },
          {
            "type": "number",
          },
        ],
      }
    `);
  });

  test("union of literals is not compacted", () => {
    const schema = z.union([z.literal("a"), z.literal("b")]);
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "anyOf": [
          {
            "const": "a",
            "type": "string",
          },
          {
            "const": "b",
            "type": "string",
          },
        ],
      }
    `);
  });

  test("discriminated unions", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("success"), data: z.string() }),
      z.object({ type: z.literal("error"), message: z.string() }),
    ]);
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "oneOf": [
          {
            "additionalProperties": false,
            "properties": {
              "data": {
                "type": "string",
              },
              "type": {
                "const": "success",
                "type": "string",
              },
            },
            "required": [
              "type",
              "data",
            ],
            "type": "object",
          },
          {
            "additionalProperties": false,
            "properties": {
              "message": {
                "type": "string",
              },
              "type": {
                "const": "error",
                "type": "string",
              },
            },
            "required": [
              "type",
              "message",
            ],
            "type": "object",
          },
        ],
      }
    `);
  });

  test("intersections", () => {
    const schema = z.intersection(z.object({ name: z.string() }), z.object({ age: z.number() }));

    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
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
  });

  test("record", () => {
    const schema = z.record(z.string(), z.boolean());
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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

  test("record openapi-3.0", () => {
    const schema = z.record(z.string(), z.boolean());
    const jsonSchema = z.toJSONSchema(schema, { target: "openapi-3.0" });
    validateOpenAPI30Schema(jsonSchema);
    expect(jsonSchema).toMatchInlineSnapshot(`
      {
        "additionalProperties": {
          "type": "boolean",
        },
        "type": "object",
      }
    `);
  });

  test("record with enum keys adds required", () => {
    const schema = z.record(z.enum(["key1", "key2"]), z.number());

    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": {
          "type": "number",
        },
        "propertyNames": {
          "enum": [
            "key1",
            "key2",
          ],
          "type": "string",
        },
        "required": [
          "key1",
          "key2",
        ],
        "type": "object",
      }
    `);
  });

  test("record with enum keys drops required for an optional-in value under io: input", () => {
    const schema = z.record(z.enum(["key1", "key2"]), z.number().default(0));

    expect(z.toJSONSchema(schema, { io: "input" }).required).toBeUndefined();
    expect(z.toJSONSchema(schema).required).toEqual(["key1", "key2"]);
    expect(z.toJSONSchema(z.record(z.enum(["key1", "key2"]), z.number()), { io: "input" }).required).toEqual([
      "key1",
      "key2",
    ]);
    // A caught value keeps required, matching the input type and z.object().
    expect(z.toJSONSchema(z.record(z.enum(["key1", "key2"]), z.number().catch(0)), { io: "input" }).required).toEqual([
      "key1",
      "key2",
    ]);
  });

  test("record stringifies numeric enum keys for propertyNames and required", () => {
    enum NumberEnum {
      Zero = 0,
      One = 1,
    }
    const schema = z.record(z.enum(NumberEnum), z.string());

    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": {
          "type": "string",
        },
        "propertyNames": {
          "enum": [
            "0",
            "1",
          ],
          "type": "string",
        },
        "required": [
          "0",
          "1",
        ],
        "type": "object",
      }
    `);
  });

  test("record with a numeric key emits propertyNames over the numeric-string form", () => {
    expect(z.toJSONSchema(z.record(z.number(), z.boolean())).propertyNames).toEqual({
      type: "string",
      pattern: "^-?\\d+(?:\\.\\d+)?$",
    });
    // range checks can't apply to a key, so only the integer shape survives
    expect(z.toJSONSchema(z.record(z.int32(), z.boolean())).propertyNames).toEqual({
      type: "string",
      pattern: "^-?\\d+$",
    });
    expect(z.toJSONSchema(z.record(z.literal([1, 2]), z.boolean()))).toMatchObject({
      propertyNames: { type: "string", enum: ["1", "2"] },
      required: ["1", "2"],
    });
    expect(z.toJSONSchema(z.record(z.literal(1), z.boolean())).propertyNames).toEqual({
      type: "string",
      const: "1",
    });
  });

  test("record key rewrite reaches through wrappers and union branches", () => {
    const numericString = { type: "string", pattern: "^-?\\d+(?:\\.\\d+)?$" };
    // a wrapper only carries its inner type once the refs are flattened, so this is decided after the record itself is emitted
    expect(
      z.toJSONSchema(
        z.record(
          z.lazy(() => z.number()),
          z.boolean()
        )
      ).propertyNames
    ).toEqual(numericString);
    expect(z.toJSONSchema(z.record(z.number().pipe(z.number()), z.boolean())).propertyNames).toEqual(numericString);
    expect(z.toJSONSchema(z.record(z.number().readonly(), z.boolean())).propertyNames).toMatchObject(numericString);
    expect(z.toJSONSchema(z.record(z.union([z.literal("Tuna"), z.literal(21)]), z.string()))).toMatchObject({
      propertyNames: {
        anyOf: [
          { type: "string", const: "Tuna" },
          { type: "string", const: "21" },
        ],
      },
      required: ["Tuna", "21"],
    });
  });

  test("record with a numeric key inlines an extracted key, and leaves a string one referenced", () => {
    expect(z.toJSONSchema(z.record(z.number().meta({ id: "Num" }), z.boolean())).propertyNames).toEqual({
      type: "string",
      pattern: "^-?\\d+(?:\\.\\d+)?$",
    });
    expect(z.toJSONSchema(z.record(z.string().meta({ id: "Str" }), z.boolean())).propertyNames).toEqual({
      $ref: "#/$defs/Str",
    });
    // the value position still wants the number form, so the two cannot share one def
    const key = z.number().meta({ id: "Shared" });
    expect(z.toJSONSchema(z.object({ a: key, b: z.record(key, z.string()) }))).toMatchObject({
      properties: { a: { $ref: "#/$defs/Shared" }, b: { propertyNames: { type: "string" } } },
      $defs: { Shared: { type: "number" } },
    });
  });

  test("record key rewrite reaches a wrapped record", () => {
    // the flatten copies a record's properties onto its wrapper by reference, so the rewrite has to find every copy
    expect(z.toJSONSchema(z.record(z.number(), z.boolean()).optional()).propertyNames).toEqual({
      type: "string",
      pattern: "^-?\\d+(?:\\.\\d+)?$",
    });
    expect(z.toJSONSchema(z.object({ a: z.record(z.literal([1, 2]), z.boolean()).optional() }))).toMatchObject({
      properties: { a: { propertyNames: { type: "string", enum: ["1", "2"] }, required: ["1", "2"] } },
    });
  });

  test("record with a recursive key converts without looping", () => {
    const numeric: any = z.lazy(() => z.union([z.number(), numeric]));
    expect(z.toJSONSchema(z.record(numeric, z.boolean())).propertyNames).toMatchObject({
      anyOf: [{ type: "string", pattern: "^-?\\d+(?:\\.\\d+)?$" }, { $ref: "#/$defs/__schema0" }],
    });
    // a key with nothing to re-express keeps the reference it had
    const stringy: any = z.lazy(() => z.union([z.string(), stringy]));
    expect(z.toJSONSchema(z.record(stringy, z.boolean())).propertyNames).toEqual({ $ref: "#/$defs/__schema0" });
    expect(
      z.toJSONSchema(z.record(z.union([z.literal("a"), z.literal("b")]).meta({ id: "Keys" }), z.boolean()))
        .propertyNames
    ).toEqual({ $ref: "#/$defs/Keys" });
  });

  test("record with a heterogeneous key stringifies only its numeric members", () => {
    // a mixed key carries no `type`, so the numeric members are caught by value rather than by type
    expect(z.toJSONSchema(z.record(z.literal(["a", 1]), z.boolean()))).toMatchObject({
      propertyNames: { enum: ["a", "1"] },
      required: ["a", "1"],
    });
    // a member no key can spell is left as it was, since the parser only ever retries a key as a number
    expect(z.toJSONSchema(z.record(z.literal(["a", true]) as any, z.boolean())).propertyNames).toEqual({
      enum: ["a", true],
    });
  });

  test("record stringifies required for every target", () => {
    const schema = z.record(z.literal([1, 2]), z.boolean());
    for (const target of ["draft-2020-12", "draft-7", "draft-4", "openapi-3.0"] as const) {
      expect(z.toJSONSchema(schema, { target }).required).toEqual(["1", "2"]);
    }
  });

  test("strict record with regex key uses propertyNames", () => {
    const schema = z.record(z.string().regex(/^label:[a-z]{2}$/), z.string());

    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": {
          "type": "string",
        },
        "propertyNames": {
          "pattern": "^label:[a-z]{2}$",
          "type": "string",
        },
        "type": "object",
      }
    `);
  });

  test("looseRecord with regex key uses patternProperties", () => {
    const schema = z.looseRecord(z.string().regex(/^label:[a-z]{2}$/), z.string());

    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "patternProperties": {
          "^label:[a-z]{2}$": {
            "type": "string",
          },
        },
        "type": "object",
      }
    `);
  });

  test("looseRecord with multiple regex patterns uses patternProperties", () => {
    const schema = z.looseRecord(
      z
        .string()
        .regex(/^prefix_/)
        .regex(/_suffix$/),
      z.number()
    );

    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "patternProperties": {
          "^prefix_": {
            "type": "number",
          },
          "_suffix$": {
            "type": "number",
          },
        },
        "type": "object",
      }
    `);
  });

  test("looseRecord without regex key uses propertyNames", () => {
    // looseRecord with plain string key should still use propertyNames
    const schema = z.looseRecord(z.string(), z.boolean());

    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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

  test("intersection of object with looseRecord uses patternProperties", () => {
    const zLabeled = z.object({ label: z.string() });
    const zLocalizedLabeled = z.looseRecord(z.string().regex(/^label:[a-z]{2}$/), z.string());
    const schema = zLabeled.and(zLocalizedLabeled);

    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "allOf": [
          {
            "additionalProperties": false,
            "properties": {
              "label": {
                "type": "string",
              },
            },
            "required": [
              "label",
            ],
            "type": "object",
          },
          {
            "patternProperties": {
              "^label:[a-z]{2}$": {
                "type": "string",
              },
            },
            "type": "object",
          },
        ],
      }
    `);
  });

  test("tuple", () => {
    const schema = z.tuple([z.string(), z.number()]);
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "items": false,
        "maxItems": 2,
        "minItems": 2,
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

  test("tuple with rest", () => {
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "items": {
          "type": "boolean",
        },
        "minItems": 2,
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

  test("tuple openapi-3.0", () => {
    const schema = z.tuple([z.string(), z.number()]);
    const jsonSchema = z.toJSONSchema(schema, { target: "openapi-3.0" });
    validateOpenAPI30Schema(jsonSchema);
    expect(jsonSchema).toMatchInlineSnapshot(`
      {
        "items": {
          "anyOf": [
            {
              "type": "string",
            },
            {
              "type": "number",
            },
          ],
        },
        "maxItems": 2,
        "minItems": 2,
        "type": "array",
      }
    `);
  });

  test("tuple with rest openapi-3.0", () => {
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());
    const jsonSchema = z.toJSONSchema(schema, { target: "openapi-3.0" });
    validateOpenAPI30Schema(jsonSchema);
    expect(jsonSchema).toMatchInlineSnapshot(`
      {
        "items": {
          "anyOf": [
            {
              "type": "string",
            },
            {
              "type": "number",
            },
            {
              "type": "boolean",
            },
          ],
        },
        "minItems": 2,
        "type": "array",
      }
    `);
  });

  test("tuple with null openapi-3.0", () => {
    const schema = z.tuple([z.string(), z.number(), z.null()]);
    const jsonSchema = z.toJSONSchema(schema, { target: "openapi-3.0" });
    validateOpenAPI30Schema(jsonSchema);
    expect(jsonSchema).toMatchInlineSnapshot(`
      {
        "items": {
          "anyOf": [
            {
              "type": "string",
            },
            {
              "type": "number",
            },
            {
              "enum": [
                null,
              ],
              "nullable": true,
              "type": "string",
            },
          ],
        },
        "maxItems": 3,
        "minItems": 3,
        "type": "array",
      }
    `);
  });

  test("tuple draft-7", () => {
    const schema = z.tuple([z.string(), z.number()]);
    expect(z.toJSONSchema(schema, { target: "draft-7", io: "input" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "additionalItems": false,
        "items": [
          {
            "type": "string",
          },
          {
            "type": "number",
          },
        ],
        "maxItems": 2,
        "minItems": 2,
        "type": "array",
      }
    `);
  });

  test("tuple with rest draft-7", () => {
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());
    expect(z.toJSONSchema(schema, { target: "draft-7", io: "input" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "additionalItems": {
          "type": "boolean",
        },
        "items": [
          {
            "type": "string",
          },
          {
            "type": "number",
          },
        ],
        "minItems": 2,
        "type": "array",
      }
    `);
  });

  test("tuple with rest draft-7 - issue #5151 regression test", () => {
    // This test addresses issue #5151: tuple with rest elements and ids in draft-7 had incorrect internal path handling affecting complex scenarios
    const primarySchema = z.string().meta({ id: "primary" });
    const restSchema = z.number().meta({ id: "rest" });
    const testSchema = z.tuple([primarySchema], restSchema);

    // Test both final output structure AND internal path handling
    const capturedPaths: string[] = [];
    const result = z.toJSONSchema(testSchema, {
      target: "draft-7",
      override: (ctx) => capturedPaths.push(ctx.path.join("/")),
    });

    // Verify correct draft-7 structure with metadata extraction
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "additionalItems": {
          "$ref": "#/definitions/rest",
        },
        "definitions": {
          "primary": {
            "type": "string",
          },
          "rest": {
            "type": "number",
          },
        },
        "items": [
          {
            "$ref": "#/definitions/primary",
          },
        ],
        "minItems": 1,
        "type": "array",
      }
    `);

    // Verify internal paths are correct (this was the actual bug)
    expect(capturedPaths).toContain("items/0"); // prefix items should use "items" path
    expect(capturedPaths).toContain("additionalItems"); // rest should use "additionalItems" path
    expect(capturedPaths).not.toContain("prefixItems/0"); // should not use draft-2020-12 paths

    // Structural validations
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.additionalItems).toBeDefined();
  });

  test("closed tuple length constraints - issue #6193", () => {
    const schema = z.tuple([z.string(), z.string(), z.object({ lang: z.string() })]);

    expect(schema.safeParse(["a", "b", { lang: "en" }, "extra"]).success).toBe(false);

    const draft2020 = z.toJSONSchema(schema, { target: "draft-2020-12" });
    expect(draft2020.items).toBe(false);
    expect(draft2020.minItems).toBe(3);
    expect(draft2020.maxItems).toBe(3);

    const draft7 = z.toJSONSchema(schema, { target: "draft-7", io: "input" });
    expect(draft7.additionalItems).toBe(false);
    expect(draft7.minItems).toBe(3);
    expect(draft7.maxItems).toBe(3);

    const openapi = z.toJSONSchema(schema, { target: "openapi-3.0" });
    validateOpenAPI30Schema(openapi);
    expect(openapi.minItems).toBe(3);
    expect(openapi.maxItems).toBe(3);
  });

  test("closed tuple with optional trailing items", () => {
    const schema = z.tuple([z.string(), z.number().optional()]);

    const draft2020 = z.toJSONSchema(schema, { target: "draft-2020-12" });
    expect(draft2020.items).toBe(false);
    expect(draft2020.minItems).toBe(1);
    expect(draft2020.maxItems).toBe(2);

    const draft7 = z.toJSONSchema(schema, { target: "draft-7", io: "input" });
    expect(draft7.additionalItems).toBe(false);
    expect(draft7.minItems).toBe(1);
    expect(draft7.maxItems).toBe(2);
  });

  test("empty closed tuple rejects extra elements", () => {
    const schema = z.tuple([]);

    const draft2020 = z.toJSONSchema(schema, { target: "draft-2020-12" });
    expect(draft2020.items).toBe(false);
    expect(draft2020.maxItems).toBe(0);

    const draft7 = z.toJSONSchema(schema, { target: "draft-7", io: "input" });
    expect(draft7.additionalItems).toBe(false);
    expect(draft7.maxItems).toBe(0);

    const openapi = z.toJSONSchema(schema, { target: "openapi-3.0" });
    validateOpenAPI30Schema(openapi);
    expect(openapi.maxItems).toBe(0);
  });

  test("closed tuple length respects io direction with defaults", () => {
    const schema = z.tuple([z.string(), z.string().default("x")]);

    const input = z.toJSONSchema(schema, { target: "draft-2020-12", io: "input" });
    expect(input.items).toBe(false);
    expect(input.minItems).toBe(1);
    expect(input.maxItems).toBe(2);

    const output = z.toJSONSchema(schema, { target: "draft-2020-12", io: "output" });
    expect(output.items).toBe(false);
    expect(output.minItems).toBe(2);
    expect(output.maxItems).toBe(2);
  });

  test("closed tuple length resolves input optionality past transform and catch", () => {
    const minItems = (schema: z.core.$ZodType, io: "input" | "output") =>
      z.toJSONSchema(schema, { target: "draft-2020-12", io }).minItems;

    // Both let the parser observe an absent slot, but declare a required input.
    const pre = z.tuple([z.string(), z.preprocess((v) => v, z.string())]);
    expect(minItems(pre, "input")).toBe(2);
    expect(minItems(pre, "output")).toBe(2);

    const caught = z.tuple([z.string(), z.string().catch("x")]);
    expect(minItems(caught, "input")).toBe(2);
    expect(minItems(caught, "output")).toBe(2);

    // Resolution passes through the wrapper rather than stopping at it.
    expect(minItems(z.tuple([z.string(), z.string().optional().catch("x")]), "input")).toBe(1);
  });

  test("promise", () => {
    const schema = z.promise(z.string());
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "string",
      }
    `);
  });

  test("lazy", () => {
    const schema = z.lazy(() => z.string());
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "string",
      }
    `);
  });

  // enum
  test("enum", () => {
    const a = z.enum(["a", "b", "c"]);
    expect(z.toJSONSchema(a)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "enum": [
          "a",
          "b",
          "c",
        ],
        "type": "string",
      }
    `);

    enum B {
      A = 0,
      B = 1,
      C = 2,
    }

    const b = z.enum(B);
    expect(z.toJSONSchema(b)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "enum": [
          0,
          1,
          2,
        ],
        "type": "number",
      }
    `);
  });

  // literal
  test("literal", () => {
    const a = z.literal("hello");
    expect(z.toJSONSchema(a)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "const": "hello",
        "type": "string",
      }
    `);

    const b = z.literal(7);
    expect(z.toJSONSchema(b)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "const": 7,
        "type": "number",
      }
    `);

    const c = z.literal(["hello", undefined, null, 5, BigInt(1324)]);
    expect(() => z.toJSONSchema(c)).toThrow();

    const d = z.literal(["hello", null, 5]);
    expect(z.toJSONSchema(d)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "enum": [
          "hello",
          null,
          5,
        ],
      }
    `);

    const e = z.literal(["hello", "zod", "v4"]);
    expect(z.toJSONSchema(e)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "enum": [
          "hello",
          "zod",
          "v4",
        ],
        "type": "string",
      }
    `);
  });

  test("literal draft-4", () => {
    const a = z.literal("hello");
    expect(z.toJSONSchema(a, { target: "draft-4" })).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "enum": [
          "hello",
        ],
        "type": "string",
      }
    `);
  });

  // pipe
  test("pipe", () => {
    const schema = z
      .string()
      .transform((val) => Number.parseInt(val))
      .pipe(z.number());
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "number",
      }
    `);
  });

  test("simple objects", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(
      `
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
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

  test("additionalproperties in z.object", () => {
    const a = z.object({
      name: z.string(),
    });
    expect(z.toJSONSchema(a)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
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
    expect(z.toJSONSchema(a, { io: "input" })).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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
    expect(
      z.toJSONSchema(a, {
        io: "input",
        override(ctx) {
          const def = ctx.zodSchema._zod.def;
          if (def.type === "object" && !def.catchall) {
            (ctx.jsonSchema as z.core.JSONSchema.ObjectSchema).additionalProperties = false;
          }
        },
      })
    ).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
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

  test("catchall objects", () => {
    const a = z.strictObject({
      name: z.string(),
      age: z.number(),
    });

    expect(z.toJSONSchema(a)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
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

    expect(z.toJSONSchema(b)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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

    expect(z.toJSONSchema(c)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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

    const result = z.toJSONSchema(schema);

    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
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

    const result = z.toJSONSchema(categorySchema);
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
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
    const userSchema = z.object({
      name: z.string(),
      age: z.number().optional(),
    });

    const result = z.toJSONSchema(userSchema);
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
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
        ],
        "type": "object",
      }
    `);
  });

  test("catchall interface", () => {
    const a = z.strictObject({
      name: z.string(),
      age: z.number(),
    });

    expect(z.toJSONSchema(a)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
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

    expect(z.toJSONSchema(b)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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

    expect(z.toJSONSchema(c)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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
    const TreeNodeSchema = z.object({
      id: z.string(),
      get children() {
        return TreeNodeSchema;
      },
    });

    const result = z.toJSONSchema(TreeNodeSchema);

    // Should have definitions for recursive schema
    expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
      `
      "{
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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
        ],
        "additionalProperties": false
      }"
    `
    );
  });

  test("mutually recursive interface schemas", () => {
    const FolderSchema = z.object({
      name: z.string(),
      get files() {
        return z.array(FileSchema);
      },
    });

    const FileSchema = z.object({
      name: z.string(),
      get parent() {
        return FolderSchema;
      },
    });

    const result = z.toJSONSchema(FolderSchema);

    // Should have definitions for both schemas
    expect(JSON.stringify(result, null, 2)).toMatchInlineSnapshot(
      `
      "{
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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
              ],
              "additionalProperties": false
            }
          }
        },
        "required": [
          "name",
          "files"
        ],
        "additionalProperties": false
      }"
    `
    );
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
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "string",
      "whatever": "sup",
    }
  `);
});

test("override: do not run on references", () => {
  let overrideCount = 0;
  const schema = z
    .union([z.string().date(), z.string().datetime(), z.string().datetime({ local: true })])
    .meta({ a: true })
    .transform((str) => new Date(str))
    .meta({ b: true })
    .pipe(z.date())
    .meta({ c: true })
    .brand("dateIn");
  z.toJSONSchema(schema, {
    unrepresentable: "any",
    io: "input",
    override(_) {
      overrideCount++;
    },
  });

  expect(overrideCount).toBe(12);
});

test("override with refs", () => {
  const a = z.string().optional();
  const result = z.toJSONSchema(a, {
    override(ctx) {
      if (ctx.zodSchema._zod.def.type === "string") {
        ctx.jsonSchema.type = "STRING" as "string";
      }
    },
  });

  expect(result).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "STRING",
    }
  `);
});

test("override execution order", () => {
  const schema = z.union([z.string(), z.number()]);
  let unionSchema!: any;
  z.toJSONSchema(schema, {
    override(ctx) {
      if (ctx.zodSchema._zod.def.type === "union") {
        unionSchema = ctx.jsonSchema;
      }
    },
  });

  expect(unionSchema).toMatchInlineSnapshot(`
    {
      "type": [
        "string",
        "number",
      ],
    }
  `);
});

test("override with path", () => {
  const userSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  const capturedPaths: (string | number)[][] = [];

  z.toJSONSchema(userSchema, {
    override(ctx) {
      capturedPaths.push(ctx.path);
    },
  });

  expect(capturedPaths).toMatchInlineSnapshot(`
    [
      [
        "properties",
        "age",
      ],
      [
        "properties",
        "name",
      ],
      [],
    ]
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
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "number",
    }
  `);
  // => { type: "number" }

  const b = z.toJSONSchema(mySchema, { io: "input" });
  expect(b).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
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
          "additionalProperties": false,
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
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
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

test("extract schemas with id", () => {
  const name = z.string().meta({ id: "name" });
  const result = z.toJSONSchema(
    z.object({
      first_name: name,
      last_name: name.nullable(),
      middle_name: name.optional(),
      age: z.number().meta({ id: "age" }),
    })
  );
  expect(result).toMatchInlineSnapshot(`
    {
      "$defs": {
        "age": {
          "type": "number",
        },
        "name": {
          "type": "string",
        },
      },
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "age": {
          "$ref": "#/$defs/age",
        },
        "first_name": {
          "$ref": "#/$defs/name",
        },
        "last_name": {
          "anyOf": [
            {
              "$ref": "#/$defs/name",
            },
            {
              "type": "null",
            },
          ],
        },
        "middle_name": {
          "$ref": "#/$defs/name",
        },
      },
      "required": [
        "first_name",
        "last_name",
        "age",
      ],
      "type": "object",
    }
  `);
});

test("escapes JSON Pointer reserved characters in $ref but not in $defs key", () => {
  const User = z.object({ name: z.string() }).meta({ id: "Shared/User~" });
  const result = z.toJSONSchema(z.object({ User }));
  // the $ref pointer escapes `/` -> `~1` and `~` -> `~0` (RFC 6901),
  // while the $defs key keeps the original id
  expect((result.properties!.User as any).$ref).toBe("#/$defs/Shared~1User~0");
  expect(Object.keys(result.$defs!)).toEqual(["Shared/User~"]);
});

test("escapes JSON Pointer reserved characters in the root $ref", () => {
  const User = z.object({ name: z.string() }).meta({ id: "Shared/User~" });
  const result = z.toJSONSchema(User);
  expect(result.$ref).toBe("#/$defs/Shared~1User~0");
  expect(Object.keys(result.$defs!)).toEqual(["Shared/User~"]);
});

test("a multipleOf divisor JSON Schema cannot express goes through `unrepresentable`", () => {
  // the keyword must be strictly greater than zero, and NaN/Infinity do not survive JSON at all
  for (const divisor of [0, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    expect(() => z.toJSONSchema(z.number().multipleOf(divisor))).toThrow(/cannot be represented in JSON Schema/);
    expect(z.toJSONSchema(z.number().multipleOf(divisor), { unrepresentable: "any" })).toMatchObject({
      type: "number",
    });
    expect(z.toJSONSchema(z.number().multipleOf(divisor), { unrepresentable: "any" })).not.toHaveProperty("multipleOf");
  }

  // a negative divisor accepts exactly what its absolute value accepts, so it still maps
  expect(z.number().multipleOf(-5).safeParse(10).success).toEqual(true);
  expect(z.number().multipleOf(-5).safeParse(13).success).toEqual(false);
  expect(z.toJSONSchema(z.number().multipleOf(-5))).toMatchObject({ multipleOf: 5 });
  expect(z.toJSONSchema(z.number().multipleOf(0.1))).toMatchObject({ multipleOf: 0.1 });
});

test("unrepresentable default values go through `unrepresentable`", () => {
  // a bigint default has no reliable JSON encoding, so it is dropped rather than approximated
  expect(z.toJSONSchema(z.bigint().default(0n), { unrepresentable: "any" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
    }
  `);
  expect(z.toJSONSchema(z.bigint().prefault(2n), { io: "input", unrepresentable: "any" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
    }
  `);
  // including when nested inside an otherwise representable default
  expect(
    z.toJSONSchema(z.object({ a: z.bigint() }).default({ a: 1n }), { unrepresentable: "any" })
  ).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "a": {},
      },
      "required": [
        "a",
      ],
      "type": "object",
    }
  `);

  // under the default strict mode the inner type throws first; a representable inner type surfaces the default's own error rather than a raw `JSON.stringify` TypeError
  expect(() => z.toJSONSchema(z.bigint().default(0n))).toThrow("BigInt cannot be represented in JSON Schema");
  expect(() => z.toJSONSchema(z.unknown().default(1n))).toThrow("BigInt defaults cannot be represented in JSON Schema");

  // representable defaults are untouched
  expect(z.toJSONSchema(z.object({ a: z.number() }).default({ a: 2 }))).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "default": {
        "a": 2,
      },
      "properties": {
        "a": {
          "type": "number",
        },
      },
      "required": [
        "a",
      ],
      "type": "object",
    }
  `);
});

test("an `unrepresentable` handler can represent a bigint default", () => {
  // one handler covers both the type and its default, so no `unrepresentable: "any"` is needed and every other unrepresentable type still throws
  expect(
    z.toJSONSchema(z.object({ startAt: z.coerce.bigint().optional().default(0n) }), {
      io: "input",
      unrepresentable: ({ zodSchema }) => {
        const def = zodSchema._zod.def;
        if (def.type === "bigint") return { type: "integer", format: "int64" };
        if (def.type === "default") return { default: String(def.defaultValue) };
        return "throw";
      },
    })
  ).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "properties": {
        "startAt": {
          "default": "0",
          "format": "int64",
          "type": "integer",
        },
      },
      "type": "object",
    }
  `);

  // a handler may also drop just the default while still representing the type
  expect(
    z.toJSONSchema(z.bigint().default(0n), {
      unrepresentable: ({ zodSchema }) =>
        zodSchema._zod.def.type === "bigint" ? { type: "integer", format: "int64" } : "any",
    })
  ).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "format": "int64",
      "type": "integer",
    }
  `);
});

test("unrepresentable literal values are ignored", () => {
  const a = z.toJSONSchema(z.literal(["hello", null, 5, BigInt(1324), undefined]), { unrepresentable: "any" });
  expect(a).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "enum": [
        "hello",
        null,
        5,
        1324,
      ],
    }
  `);

  const b = z.toJSONSchema(z.literal([undefined, null, 5, BigInt(1324)]), {
    unrepresentable: "any",
  });
  expect(b).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "enum": [
        null,
        5,
        1324,
      ],
    }
  `);

  const c = z.toJSONSchema(z.literal([undefined]), {
    unrepresentable: "any",
  });
  expect(c).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
    }
  `);
});

test("describe with id", () => {
  const jobId = z.string().meta({ id: "jobId" });

  const a = z.toJSONSchema(
    z.object({
      current: jobId.describe("Current job"),
      previous: jobId.describe("Previous job"),
    })
  );
  expect(a).toMatchInlineSnapshot(`
    {
      "$defs": {
        "jobId": {
          "type": "string",
        },
      },
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "current": {
          "$ref": "#/$defs/jobId",
          "description": "Current job",
        },
        "previous": {
          "$ref": "#/$defs/jobId",
          "description": "Previous job",
        },
      },
      "required": [
        "current",
        "previous",
      ],
      "type": "object",
    }
  `);
});

test("id is stripped from $defs entries (draft-2020-12)", () => {
  // The `id` in `.meta()` is a registration tag — it determines the $defs key but should not leak into the definition body, where it is redundant.
  const inner = z.string().meta({ id: "Inner" });
  const result = z.toJSONSchema(z.object({ a: inner, b: inner }));
  expect(result.$defs?.Inner).toEqual({ type: "string" });
  expect((result.$defs?.Inner as any).id).toBeUndefined();
});

test("id is stripped from definitions entries (draft-04)", () => {
  // In draft-04, `id` is a reserved keyword that sets a base URI for the subschema. Leaking Zod's registration tag here is semantically wrong, so ensure it is stripped.
  const inner = z.string().meta({ id: "Inner" });
  const result = z.toJSONSchema(z.object({ a: inner, b: inner }), { target: "draft-04" }) as any;
  expect(result.definitions?.Inner).toEqual({ type: "string" });
  expect(result.definitions?.Inner?.id).toBeUndefined();
});

test("id is stripped from root schema", () => {
  // The registration tag should not appear on the root either.
  const A = z.object({ name: z.string() }).meta({ id: "A" });
  const result = z.toJSONSchema(A);
  expect((result as any).id).toBeUndefined();
});

test("root schema with id is hoisted into $defs", () => {
  const A = z.object({ name: z.string() }).meta({ id: "A" });
  const result = z.toJSONSchema(A);

  expect(result).toEqual({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $ref: "#/$defs/A",
    $defs: {
      A: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  });
});

test("root schema with id uses definitions on legacy targets", () => {
  const A = z.object({ name: z.string() }).meta({ id: "A" });
  const result = z.toJSONSchema(A, { target: "draft-07" });

  expect(result).toEqual({
    $schema: "http://json-schema.org/draft-07/schema#",
    $ref: "#/definitions/A",
    definitions: {
      A: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  });
});

test("id is observable in override callback", () => {
  // The strip happens after override callbacks run, so userland override code can still read `jsonSchema.id` if it wants to.
  const inner = z.string().meta({ id: "Inner" });
  const seenIds: Array<string | undefined> = [];
  z.toJSONSchema(z.object({ a: inner }), {
    override: ({ jsonSchema }) => {
      if (jsonSchema.id !== undefined) seenIds.push(jsonSchema.id as string);
    },
  });
  expect(seenIds).toContain("Inner");
});

test("describe with id on wrapper", () => {
  // Test that $ref propagation works when processor sets a different ref (readonly -> innerType) but parent was extracted due to having an id
  const roJobId = z.string().readonly().meta({ id: "roJobId" });

  const a = z.toJSONSchema(
    z.object({
      current: roJobId.describe("Current readonly job"),
      previous: roJobId.describe("Previous readonly job"),
    })
  );
  expect(a).toMatchInlineSnapshot(`
    {
      "$defs": {
        "roJobId": {
          "readOnly": true,
          "type": "string",
        },
      },
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "current": {
          "$ref": "#/$defs/roJobId",
          "description": "Current readonly job",
        },
        "previous": {
          "$ref": "#/$defs/roJobId",
          "description": "Previous readonly job",
        },
      },
      "required": [
        "current",
        "previous",
      ],
      "type": "object",
    }
  `);
});

test("overwrite id", () => {
  const jobId = z.string().meta({ id: "aaa" });

  const a = z.toJSONSchema(
    z.object({
      current: jobId,
      previous: jobId.meta({ id: "bbb" }),
    })
  );
  expect(a).toMatchInlineSnapshot(`
    {
      "$defs": {
        "aaa": {
          "type": "string",
        },
        "bbb": {
          "$ref": "#/$defs/aaa",
        },
      },
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "current": {
          "$ref": "#/$defs/aaa",
        },
        "previous": {
          "$ref": "#/$defs/bbb",
        },
      },
      "required": [
        "current",
        "previous",
      ],
      "type": "object",
    }
  `);

  const b = z.toJSONSchema(
    z.object({
      current: jobId,
      previous: jobId.meta({ id: "ccc" }),
    }),
    {
      reused: "ref",
    }
  );
  expect(b).toMatchInlineSnapshot(`
    {
      "$defs": {
        "aaa": {
          "type": "string",
        },
        "ccc": {
          "$ref": "#/$defs/aaa",
        },
      },
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "current": {
          "$ref": "#/$defs/aaa",
        },
        "previous": {
          "$ref": "#/$defs/ccc",
        },
      },
      "required": [
        "current",
        "previous",
      ],
      "type": "object",
    }
  `);
});

test("overwrite descriptions", () => {
  const field = z.string().describe("a").describe("b").describe("c");

  const a = z.toJSONSchema(
    z.object({
      d: field.describe("d"),
      e: field.describe("e"),
    })
  );
  expect(a).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "d": {
          "description": "d",
          "type": "string",
        },
        "e": {
          "description": "e",
          "type": "string",
        },
      },
      "required": [
        "d",
        "e",
      ],
      "type": "object",
    }
  `);

  const b = z.toJSONSchema(
    z.object({
      d: field.describe("d"),
      e: field.describe("e"),
    }),
    {
      reused: "ref",
    }
  );
  expect(b).toMatchInlineSnapshot(`
    {
      "$defs": {
        "__schema0": {
          "description": "c",
          "type": "string",
        },
      },
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "d": {
          "$ref": "#/$defs/__schema0",
          "description": "d",
        },
        "e": {
          "$ref": "#/$defs/__schema0",
          "description": "e",
        },
      },
      "required": [
        "d",
        "e",
      ],
      "type": "object",
    }
  `);
});

test("top-level readonly", () => {
  const A = z
    .object({
      name: z.string(),
      get b() {
        return B;
      },
    })
    .readonly()
    .meta({ id: "A" });
  // z.globalRegistry.add(A, { id: "A" });
  // .meta({ id: "A" });

  const B = z
    .object({
      name: z.string(),
      get a() {
        return A;
      },
    })
    .readonly()
    .meta({ id: "B" });
  // z.globalRegistry.add(B, { id: "B" });
  // .meta({ id: "B" });

  const result = z.toJSONSchema(A);
  expect(result).toEqual({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $ref: "#/$defs/A",
    $defs: {
      A: {
        additionalProperties: false,
        properties: {
          b: {
            $ref: "#/$defs/B",
          },
          name: {
            type: "string",
          },
        },
        readOnly: true,
        required: ["name", "b"],
        type: "object",
      },
      B: {
        additionalProperties: false,
        properties: {
          a: {
            $ref: "#/$defs/A",
          },
          name: {
            type: "string",
          },
        },
        readOnly: true,
        required: ["name", "a"],
        type: "object",
      },
    },
  });
});

test("basic registry", () => {
  const myRegistry = z.registry<{ id: string }>();
  const User = z.object({
    name: z.string(),
    get posts() {
      return z.array(Post);
    },
  });

  const Post = z.object({
    title: z.string(),
    content: z.string(),
    get author() {
      return User;
    },
  });

  myRegistry.add(User, { id: "User" });
  myRegistry.add(Post, { id: "Post" });

  const result = z.toJSONSchema(myRegistry, {
    uri: (id) => `https://example.com/${id}.json`,
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "schemas": {
        "Post": {
          "$id": "https://example.com/Post.json",
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false,
          "properties": {
            "author": {
              "$ref": "https://example.com/User.json",
            },
            "content": {
              "type": "string",
            },
            "title": {
              "type": "string",
            },
          },
          "required": [
            "title",
            "content",
            "author",
          ],
          "type": "object",
        },
        "User": {
          "$id": "https://example.com/User.json",
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "additionalProperties": false,
          "properties": {
            "name": {
              "type": "string",
            },
            "posts": {
              "items": {
                "$ref": "https://example.com/Post.json",
              },
              "type": "array",
            },
          },
          "required": [
            "name",
            "posts",
          ],
          "type": "object",
        },
      },
    }
  `);
});

test("large registry converts in linear time", () => {
  const count = 2000;
  const convert = (withIntersection: boolean) => {
    const registry = z.registry<{ id: string }>();
    for (let i = 0; i < count; i++) {
      registry.add(
        z.object({ id: z.string(), name: z.string(), count: z.number(), nested: z.object({ a: z.boolean() }) }),
        { id: `Type${i}` }
      );
    }
    if (withIntersection) registry.add(z.object({ a: z.string() }).and(z.object({ b: z.string() })), { id: "Inter" });

    const start = performance.now();
    const { schemas } = z.toJSONSchema(registry, { uri: (id) => `https://example.com/${id}.json` });
    return { schemas, elapsed: performance.now() - start };
  };

  const plain = convert(false);
  expect(Object.keys(plain.schemas)).toHaveLength(count);
  expect(plain.schemas.Type0).toMatchObject({
    $id: "https://example.com/Type0.json",
    type: "object",
    properties: { nested: { type: "object" } },
  });
  expect(plain.schemas[`Type${count - 1}`]!.$id).toBe(`https://example.com/Type${count - 1}.json`);

  // The whole-map passes in extractDefs/finalize used to re-run once per registered schema, which made this quadratic: ~9s of CPU at this size before the passes were hoisted, ~50ms after.
  expect(plain.elapsed).toBeLessThan(5000);

  // The intersection fold walks the whole map as well, so it has to run inside the same guard. Hoisting it back out costs ~10x at this size. Comparing the two conversions rather than asserting a fixed budget keeps this independent of how fast the machine is.
  const folded = convert(true);
  expect(folded.schemas.Inter).toMatchObject({ type: "object", properties: { a: {}, b: {} } });
  expect(folded.elapsed).toBeLessThan(plain.elapsed * 4 + 100);
});

test("a registry of records with numeric keys converts in linear time", () => {
  const count = 2000;
  const convert = (key: (i: number) => z.core.$ZodType) => {
    const registry = z.registry<{ id: string }>();
    for (let i = 0; i < count; i++) {
      registry.add(z.object({ m: z.record(key(i) as z.core.$ZodRecordKey, z.boolean()) }), { id: `Type${i}` });
    }
    const start = performance.now();
    const { schemas } = z.toJSONSchema(registry, { uri: (id) => `https://example.com/${id}.json` });
    return { schemas, elapsed: performance.now() - start };
  };

  const string = convert(() => z.string());
  const numeric = convert(() => z.number());
  expect(numeric.schemas.Type0).toMatchObject({
    properties: { m: { propertyNames: { type: "string", pattern: "^-?\\d+(?:\\.\\d+)?$" } } },
  });

  // The rewrite has to find every carrier the flatten copied `propertyNames` onto, which means a pass over the whole seen map. Running that once per record rather than once per conversion cost ~10x at this size. A string key needs no rewrite at all, so comparing against it keeps this independent of how fast the machine is.
  expect(numeric.elapsed).toBeLessThan(string.elapsed * 2 + 50);

  // An extracted key resolves through a map built once per conversion rather than a search per reference. There is no stable timing control for that — extraction has its own $defs cost, which swamps the difference — so this only pins the shape.
  const extracted = convert((i) => z.number().meta({ id: `Key${i}` }));
  expect(extracted.schemas.Type0).toMatchObject({
    properties: { m: { propertyNames: { type: "string", pattern: "^-?\\d+(?:\\.\\d+)?$" } } },
  });
});

test("registry extracts unregistered subschemas into __shared", () => {
  const registry = z.registry<{ id: string }>();
  const address = z.object({ street: z.string() }).meta({ id: "Address" });
  registry.add(z.object({ home: address, work: address }), { id: "Person" });
  registry.add(z.object({ hq: address }), { id: "Company" });

  const { schemas } = z.toJSONSchema(registry, { uri: (id) => `https://example.com/${id}.json` });

  expect(schemas.__shared).toMatchInlineSnapshot(`
    {
      "$defs": {
        "Address": {
          "additionalProperties": false,
          "properties": {
            "street": {
              "type": "string",
            },
          },
          "required": [
            "street",
          ],
          "type": "object",
        },
      },
    }
  `);
  expect(schemas.Person).toMatchInlineSnapshot(`
    {
      "$id": "https://example.com/Person.json",
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "home": {
          "$ref": "https://example.com/__shared.json#/$defs/Address",
        },
        "work": {
          "$ref": "https://example.com/__shared.json#/$defs/Address",
        },
      },
      "required": [
        "home",
        "work",
      ],
      "type": "object",
    }
  `);
  // Company is emitted after Person, so it only resolves if the shared $defs built on the first finalize are still reachable — the pass that writes them no longer runs per schema.
  expect(schemas.Company!.properties!.hq).toEqual({
    $ref: "https://example.com/__shared.json#/$defs/Address",
  });
});

test("registry extracts reused subschemas into __shared without an id", () => {
  const registry = z.registry<{ id: string }>();
  const shared = z.object({ q: z.string() });
  registry.add(z.object({ a: shared, b: shared }), { id: "First" });
  registry.add(z.object({ c: shared }), { id: "Second" });

  const { schemas } = z.toJSONSchema(registry, { uri: (id) => `${id}.json`, reused: "ref" });

  // The id is counter-generated, so this pins that ctx.counter is consumed exactly once.
  expect(Object.keys(schemas.__shared!.$defs!)).toEqual(["schema0"]);
  expect(schemas.First!.properties!.a).toEqual({ $ref: "__shared.json#/$defs/schema0" });
  expect(schemas.Second!.properties!.c).toEqual({ $ref: "__shared.json#/$defs/schema0" });
});

test("JSONSchemaGenerator re-runs shared passes when emit params change", () => {
  const shared = z.object({ s: z.string() });
  const a = z.object({ x: shared, y: shared });
  const registry = z.registry<{ id: string }>();
  registry.add(a, { id: "A" });

  const gen = new z.core.JSONSchemaGenerator({ target: "draft-2020-12" });
  gen.process(a);
  const defs: Record<string, any> = {};
  const external = { registry, uri: (id: string) => `${id}.json`, defs };

  gen.emit(a, { external, reused: "inline" });
  // Same `external`, different `reused` — the second emit must still extract `shared`.
  const second: any = gen.emit(a, { external, reused: "ref" });

  expect(Object.keys(defs)).toEqual(["schema0"]);
  expect(second.properties.x).toEqual({ $ref: "__shared.json#/$defs/schema0" });
  expect(second.properties.y).toEqual({ $ref: "__shared.json#/$defs/schema0" });
});

test("JSONSchemaGenerator still throws on cycles when a later emit asks for it", () => {
  const Node: any = z.object({
    v: z.string(),
    get next() {
      return Node;
    },
  });
  const registry = z.registry<{ id: string }>();
  registry.add(Node, { id: "Node" });

  const gen = new z.core.JSONSchemaGenerator({ target: "draft-2020-12" });
  gen.process(Node);
  const external = { registry, uri: (id: string) => `${id}.json`, defs: {} };

  gen.emit(Node, { external, cycles: "ref" });
  expect(() => gen.emit(Node, { external, cycles: "throw" })).toThrow(/Cycle detected/);
});

test("JSONSchemaGenerator re-runs shared passes on a no-params emit", () => {
  const shared = z.object({ s: z.string() });
  const a = z.object({ x: shared });
  const registry = z.registry<{ id: string }>();
  registry.add(a, { id: "A" });

  const gen = new z.core.JSONSchemaGenerator({ target: "draft-2020-12" });
  gen.process(a);
  const defs: Record<string, any> = {};
  gen.emit(a, { external: { registry, uri: (id: string) => `${id}.json`, defs }, reused: "ref" });

  // Re-processing an already-seen schema bumps `seen.count`, which `extractDefs` branches on under `reused: "ref"` — and it returns early, so it cannot clear the guards itself.
  gen.process(shared);
  const second: any = gen.emit(a);

  expect(Object.keys(defs)).toEqual(["schema0"]);
  expect(second.properties.x).toEqual({ $ref: "__shared.json#/$defs/schema0" });
});

test("_ref", () => {
  // const a = z.promise(z.string().describe("a"));
  const a = z.toJSONSchema(z.promise(z.string().describe("a")));
  expect(a).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "description": "a",
      "type": "string",
    }
  `);

  const b = z.toJSONSchema(z.lazy(() => z.string().describe("a")));
  expect(b).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "description": "a",
      "type": "string",
    }
  `);

  const c = z.toJSONSchema(z.optional(z.string().describe("a")));
  expect(c).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "description": "a",
      "type": "string",
    }
  `);

  const d = z.toJSONSchema(z.string().meta({ id: "foo" }).describe("bar").optional());
  expect(d).toMatchInlineSnapshot(`
    {
      "$defs": {
        "foo": {
          "type": "string",
        },
      },
      "$ref": "#/$defs/foo",
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "description": "bar",
    }
  `);
});

test("defaults/prefaults", () => {
  const a = z
    .string()
    .transform((val) => val.length)
    .pipe(z.number());
  const b = a.prefault("hello");
  const c = a.default(1234);

  // a
  expect(z.toJSONSchema(a)).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "number",
    }
  `);
  expect(z.toJSONSchema(a, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "string",
    }
  `);

  // b
  expect(z.toJSONSchema(b)).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "number",
    }
  `);
  expect(z.toJSONSchema(b, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "default": "hello",
      "type": "string",
    }
  `);
  // c
  expect(z.toJSONSchema(c)).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "default": 1234,
      "type": "number",
    }
  `);
  expect(z.toJSONSchema(c, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "string",
    }
  `);
});

test("catch on a transforming schema", () => {
  const a = z
    .string()
    .transform((val) => val.length)
    .pipe(z.number())
    .catch(0);

  expect(z.toJSONSchema(a)).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "default": 0,
      "type": "number",
    }
  `);
  // catch values are output-typed, so they are not valid input
  expect(z.toJSONSchema(a, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "string",
    }
  `);

  // the catch no longer hides the inner transform from ancestors, so their output-typed metadata is stripped too — matching a bare nested transform
  expect(z.toJSONSchema(z.object({ a }).meta({ examples: [{ a: 1 }] }), { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "properties": {
        "a": {
          "type": "string",
        },
      },
      "required": [
        "a",
      ],
      "type": "object",
    }
  `);
});

test("falsy prefaults (false, 0, empty string)", () => {
  // boolean prefault false
  const a = z.boolean().prefault(false);
  expect(z.toJSONSchema(a, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "default": false,
      "type": "boolean",
    }
  `);

  // number prefault 0
  const b = z.number().prefault(0);
  expect(z.toJSONSchema(b, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "default": 0,
      "type": "number",
    }
  `);

  // string prefault empty string
  const c = z.string().prefault("");
  expect(z.toJSONSchema(c, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "default": "",
      "type": "string",
    }
  `);
});

test("input type", () => {
  const schema = z.object({
    a: z.string(),
    b: z.string().optional(),
    c: z.string().default("hello"),
    d: z.string().nullable(),
    e: z.string().prefault("hello"),
    f: z.string().catch("hello"),
    g: z.never(),
    h: z.union([z.string(), z.number().default(2)]),
    i: z.union([z.string(), z.string().optional()]),
  });
  expect(z.toJSONSchema(schema, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "properties": {
        "a": {
          "type": "string",
        },
        "b": {
          "type": "string",
        },
        "c": {
          "default": "hello",
          "type": "string",
        },
        "d": {
          "type": [
            "string",
            "null",
          ],
        },
        "e": {
          "default": "hello",
          "type": "string",
        },
        "f": {
          "default": "hello",
          "type": "string",
        },
        "g": {
          "not": {},
        },
        "h": {
          "anyOf": [
            {
              "type": "string",
            },
            {
              "default": 2,
              "type": "number",
            },
          ],
        },
        "i": {
          "type": "string",
        },
      },
      "required": [
        "a",
        "d",
        "f",
        "g",
      ],
      "type": "object",
    }
  `);
  expect(z.toJSONSchema(schema, { io: "output" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "properties": {
        "a": {
          "type": "string",
        },
        "b": {
          "type": "string",
        },
        "c": {
          "default": "hello",
          "type": "string",
        },
        "d": {
          "type": [
            "string",
            "null",
          ],
        },
        "e": {
          "type": "string",
        },
        "f": {
          "default": "hello",
          "type": "string",
        },
        "g": {
          "not": {},
        },
        "h": {
          "anyOf": [
            {
              "type": "string",
            },
            {
              "default": 2,
              "type": "number",
            },
          ],
        },
        "i": {
          "type": "string",
        },
      },
      "required": [
        "a",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
      ],
      "type": "object",
    }
  `);
});

test("examples on pipe", () => {
  const schema = z
    .string()
    .meta({ examples: ["test"] })
    .transform(Number)
    // .pipe(z.transform(Number).meta({ examples: [4] }))
    .meta({ examples: [4] });

  const i = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
  expect(i).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "examples": [
        "test",
      ],
      "type": "string",
    }
  `);
  const o = z.toJSONSchema(schema, { io: "output", unrepresentable: "any" });
  expect(o).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "examples": [
        4,
      ],
    }
  `);
});

// test("number checks", () => {
//   expect(z.toJSONSchema(z.number().int())).toMatchInlineSnapshot(`
//     {
//       "maximum": 9007199254740991,
//       "minimum": -9007199254740991,
//       "type": "integer",
//     }
//   `);
//   expect(z.toJSONSchema(z.int())).toMatchInlineSnapshot(`
//     {
//       "maximum": 9007199254740991,
//       "minimum": -9007199254740991,
//       "type": "integer",
//     }
//   `);
//   expect(z.toJSONSchema(z.int().positive())).toMatchInlineSnapshot(`
//     {
//       "exclusiveMinimum": 0,
//       "maximum": 9007199254740991,
//       "minimum": -9007199254740991,
//       "type": "integer",
//     }
//   `);
//   expect(z.toJSONSchema(z.int().nonnegative())).toMatchInlineSnapshot(`
//     {
//       "maximum": 9007199254740991,
//       "minimum": 0,
//       "type": "integer",
//     }
//   `);
//   expect(z.toJSONSchema(z.int().gt(0))).toMatchInlineSnapshot(`
//     {
//       "exclusiveMinimum": 0,
//       "maximum": 9007199254740991,
//       "minimum": -9007199254740991,
//       "type": "integer",
//     }
//   `);
//   expect(z.toJSONSchema(z.int().gte(0))).toMatchInlineSnapshot(`
//     {
//       "maximum": 9007199254740991,
//       "minimum": 0,
//       "type": "integer",
//     }
//   `);

// });

test("use output type for preprocess", () => {
  const a = z.preprocess((val) => String(val), z.string());

  expect(z.toJSONSchema(a, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "string",
    }
  `);
});

test("object property with preprocess stays required in input JSON schema", () => {
  const schema = z.object({
    noPreprocess: z.string(),
    withPreprocess: z.preprocess((v) => v, z.string()),
    optionalPreprocess: z.preprocess((v) => v, z.string().optional()),
  });

  // A preprocessed property is only optional when its inner schema is — the
  // transform wrapper must not make a required property optional in the input
  // JSON schema (matches runtime: `schema.parse({})` rejects `withPreprocess`).
  expect(z.toJSONSchema(schema, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "properties": {
        "noPreprocess": {
          "type": "string",
        },
        "optionalPreprocess": {
          "type": "string",
        },
        "withPreprocess": {
          "type": "string",
        },
      },
      "required": [
        "noPreprocess",
        "withPreprocess",
      ],
      "type": "object",
    }
  `);
});

test("input JSON schema resolves requiredness past transform and catch wrappers", () => {
  const required = (schema: z.ZodObject) =>
    (z.toJSONSchema(schema, { io: "input" }) as z.core.JSONSchema.ObjectSchema).required;
  const id = (v: unknown) => v;

  // catch observes an absent key at runtime, but its declared input type stays required (#5003)
  expect(required(z.object({ a: z.string().catch("x") }))).toEqual(["a"]);
  expect(required(z.object({ a: z.string().optional().catch("x") }))).toBeUndefined();
  // nested preprocess and the legacy transform-pipe form both resolve through to the inner schema
  expect(required(z.object({ a: z.preprocess(id, z.preprocess(id, z.string())) }))).toEqual(["a"]);
  expect(required(z.object({ a: z.transform((v: unknown) => String(v)).pipe(z.string()) }))).toEqual(["a"]);
});

test("strip output-side examples from input JSON schema for codec", () => {
  const codec = z
    .codec(z.string(), z.number(), { decode: (s) => Number(s), encode: (n) => String(n) })
    .meta({ examples: [42] });

  expect(z.toJSONSchema(codec, { io: "input" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "string",
    }
  `);
  expect(z.toJSONSchema(codec, { io: "output" })).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "examples": [
        42,
      ],
      "type": "number",
    }
  `);
});

// test("isTransforming", () => {
//   const tx = z.core.isTransforming;
//   expect(tx(z.string())).toEqual(false);
//   expect(tx(z.string().transform((val) => val))).toEqual(true);
//   expect(tx(z.string().pipe(z.string()))).toEqual(false);
//   expect(
//     tx(
//       z
//         .string()
//         .transform((val) => val)
//         .pipe(z.string())
//     )
//   ).toEqual(true);

//   const a = z.transform((val) => val);
//   expect(tx(z.transform((val) => val))).toEqual(true);
//   expect(tx(a.optional())).toEqual(true);

//   const b = z.string().optional();
//   expect(tx(b)).toEqual(false);

//   const c = z.string().prefault("hello");
//   expect(tx(c)).toEqual(false);

//   const d = z.string().default("hello");
//   expect(tx(d)).toEqual(false);
// });

test("flatten simple intersections", () => {
  const FirstSchema = z.object({
    testNum: z.number(),
  });

  const SecondSchema = z.object({
    testStr: z.string(),
  });

  const ThirdSchema = z.object({
    testBool: z.boolean(),
  });

  const HelloSchema = FirstSchema.and(SecondSchema).and(ThirdSchema).describe("123");

  // Zod 3
  // console.log(JSON.stringify(zodToJsonSchema(HelloSchema), null, 2));

  // Zod 4
  const result = z.toJSONSchema(HelloSchema, { target: "draft-7" });
  expect(result).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "description": "123",
      "properties": {
        "testBool": {
          "type": "boolean",
        },
        "testNum": {
          "type": "number",
        },
        "testStr": {
          "type": "string",
        },
      },
      "required": [
        "testNum",
        "testStr",
        "testBool",
      ],
      "type": "object",
    }
  `);
});

test("z.file()", () => {
  const a = z.file();
  expect(z.toJSONSchema(a)).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "contentEncoding": "binary",
      "format": "binary",
      "type": "string",
    }
  `);

  const b = z.file().mime("image/png").min(1000).max(10000);
  expect(z.toJSONSchema(b)).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "contentEncoding": "binary",
      "contentMediaType": "image/png",
      "format": "binary",
      "maxLength": 10000,
      "minLength": 1000,
      "type": "string",
    }
  `);

  const c = z.file().mime(["image/png", "image/jpg"]).min(1000).max(10000);
  expect(z.toJSONSchema(c)).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "anyOf": [
        {
          "contentMediaType": "image/png",
        },
        {
          "contentMediaType": "image/jpg",
        },
      ],
      "contentEncoding": "binary",
      "format": "binary",
      "maxLength": 10000,
      "minLength": 1000,
      "type": "string",
    }
  `);
});

test("custom toJSONSchema", () => {
  const schema = z.instanceof(Date);
  schema._zod.toJSONSchema = () => ({
    type: "string",
    format: "date-time",
  });

  expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "format": "date-time",
      "type": "string",
    }
  `);
});

test("cycle detection - root", () => {
  const schema = z.object({
    name: z.string(),
    get subcategories() {
      return z.array(schema);
    },
  });

  expect(() => z.toJSONSchema(schema, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
    [Error: Cycle detected: #/properties/subcategories/items/<root>

    Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
  `);
});

test("cycle detection - mutual recursion", () => {
  const A = z.object({
    name: z.string(),
    get subcategories() {
      return z.array(B);
    },
  });

  const B = z.object({
    name: z.string(),
    get subcategories() {
      return z.array(A);
    },
  });

  expect(() => z.toJSONSchema(A, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
    [Error: Cycle detected: #/properties/subcategories/items/properties/subcategories/items/<root>

    Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
  `);
});

test("recursive lazy with describe does not stack overflow", () => {
  const NodeSchema: z.ZodType = z.lazy(() =>
    z
      .object({
        value: z.string().describe("node value"),
        children: z.array(NodeSchema.describe("child node")).optional().describe("child list"),
      })
      .describe("tree node")
  );

  const result = z.toJSONSchema(NodeSchema, { cycles: "ref", reused: "ref" });
  expect(result).toBeDefined();
  expect(result.$defs).toBeDefined();
});

test("__proto__ shape key is emitted as an own property", () => {
  const schema = z.object({ ["__proto__"]: z.literal("admin"), role: z.string() });
  const result = z.toJSONSchema(schema, { io: "input" });

  expect(result.required).toEqual(["__proto__", "role"]);
  // every required key needs a matching entry in properties
  for (const key of result.required!) {
    expect(Object.prototype.hasOwnProperty.call(result.properties, key)).toBe(true);
  }
  expect(JSON.parse(JSON.stringify(result)).properties.__proto__).toEqual({ type: "string", const: "admin" });
});

test("__proto__ registry id is emitted as an own entry", () => {
  const myRegistry = z.registry<{ id: string }>();
  myRegistry.add(z.object({ a: z.string() }), { id: "__proto__" });
  myRegistry.add(z.object({ b: z.string() }), { id: "normal" });

  expect(Object.keys(z.toJSONSchema(myRegistry).schemas)).toEqual(["__proto__", "normal"]);
});

test("__proto__ def id emits a resolvable $ref", () => {
  const myRegistry = z.registry<{ id: string }>();
  const Inner = z.object({ x: z.string() });
  myRegistry.add(Inner, { id: "__proto__" });

  const json = JSON.parse(JSON.stringify(z.toJSONSchema(z.object({ a: Inner, b: Inner }), { metadata: myRegistry })));
  expect(json.properties.a.$ref).toBe("#/$defs/__proto__");
  expect(json.$defs.__proto__).toBeDefined();
});

test("__proto__ patternProperties key is emitted as an own property", () => {
  const result = z.toJSONSchema(z.looseRecord(z.string().regex(/__proto__/), z.string()));

  expect(Object.getPrototypeOf(result.patternProperties)).toBe(Object.prototype);
  expect(Object.prototype.hasOwnProperty.call(result.patternProperties, "__proto__")).toBe(true);
  expect(result.patternProperties?.__proto__).toEqual({ type: "string" });
});

test("__proto__ metadata survives direct and wrapper metadata merges", () => {
  for (const schema of [z.string(), z.readonly(z.string())]) {
    const registry = z.registry<Record<string, unknown>>();
    registry.add(schema, Object.fromEntries([["__proto__", { marker: true }]]));

    const result: any = z.toJSONSchema(schema, { metadata: registry });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(result, "__proto__")).toBe(true);
    expect(result.__proto__).toEqual({ marker: true });
    expect(JSON.parse(JSON.stringify(result)).__proto__).toEqual({ marker: true });
  }
});

test("partialRecord does not require finite keys", () => {
  const result = z.toJSONSchema(z.partialRecord(z.enum(["__proto__", "b"]), z.string()));

  expect(result.required).toBeUndefined();
  expect(result.propertyNames).toEqual({ type: "string", enum: ["__proto__", "b"] });
  expect(result.additionalProperties).toEqual({ type: "string" });
});

describe("unrepresentable callback", () => {
  test("is consulted for every unrepresentable type", () => {
    const seen: string[] = [];
    const collect: z.core.UnrepresentableHandler<z.core.$ZodTypes> = ({ zodSchema }) => {
      seen.push(zodSchema._zod.def.type);
      return "any";
    };

    const schemas = [
      z.bigint(),
      z.symbol(),
      z.undefined(),
      z.void(),
      z.date(),
      z.nan(),
      z.custom<string>(),
      z.map(z.string(), z.string()),
      z.set(z.string()),
      z.transform((x: unknown) => x),
      z.literal([undefined]),
      z.literal([1n]),
      z.string().catch(() => {
        throw new Error("dynamic");
      }),
      // z.function() is not a ZodType, but its processor is reachable through the same path
      z.function() as unknown as z.ZodType,
    ];
    for (const schema of schemas) z.toJSONSchema(schema, { unrepresentable: collect });

    expect(seen).toEqual([
      "bigint",
      "symbol",
      "undefined",
      "void",
      "date",
      "nan",
      "custom",
      "map",
      "set",
      "transform",
      "literal",
      "literal",
      "catch",
      "function",
    ]);
  });

  test("returned JSON Schema replaces the unrepresentable node", () => {
    // the motivating case: represent dates, keep throwing for everything else
    const params: z.core.ToJSONSchemaParams = {
      unrepresentable: ({ zodSchema }) =>
        zodSchema._zod.def.type === "date" ? { type: "string", format: "date-time" } : "throw",
    };
    expect(z.toJSONSchema(z.object({ when: z.date() }), params)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "when": {
            "format": "date-time",
            "type": "string",
          },
        },
        "required": [
          "when",
        ],
        "type": "object",
      }
    `);
    expect(() => z.toJSONSchema(z.object({ id: z.bigint() }), params)).toThrow(
      "BigInt cannot be represented in JSON Schema"
    );
  });

  test("`throw` and `undefined` returns produce the default error", () => {
    expect(() => z.toJSONSchema(z.date(), { unrepresentable: () => "throw" })).toThrow(
      "Date cannot be represented in JSON Schema"
    );
    expect(() => z.toJSONSchema(z.date(), { unrepresentable: () => undefined })).toThrow(
      "Date cannot be represented in JSON Schema"
    );
  });

  test("`any` return matches the string option", () => {
    expect(z.toJSONSchema(z.date(), { unrepresentable: () => "any" })).toEqual(
      z.toJSONSchema(z.date(), { unrepresentable: "any" })
    );
  });

  test("`message` distinguishes sites that share a schema", () => {
    const seen: string[] = [];
    expect(
      z.toJSONSchema(z.literal([undefined, 1n, "a"]), {
        unrepresentable: ({ zodSchema, message }) => {
          seen.push(`${zodSchema._zod.def.type}: ${message}`);
          return "any";
        },
      })
    ).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "enum": [
          1,
          "a",
        ],
      }
    `);
    // same `zodSchema`, different message -- the only way to tell the two literal sites apart
    expect(seen).toEqual([
      "literal: Literal `undefined` cannot be represented in JSON Schema",
      "literal: BigInt literals cannot be represented in JSON Schema",
    ]);
  });

  test("errors thrown by the callback propagate", () => {
    expect(() =>
      z.toJSONSchema(z.object({ when: z.date() }), {
        unrepresentable: ({ zodSchema, path }) => {
          throw new Error(`${zodSchema._zod.def.type} at /${path.join("/")}`);
        },
      })
    ).toThrow("date at /properties/when");
  });

  test("runs before `override`", () => {
    const order: string[] = [];
    expect(
      z.toJSONSchema(z.date(), {
        unrepresentable: () => {
          order.push("unrepresentable");
          return { type: "string" };
        },
        override: (ctx) => {
          order.push("override");
          if (ctx.jsonSchema.type === "string") ctx.jsonSchema.format = "date-time";
        },
      })
    ).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "date-time",
        "type": "string",
      }
    `);
    expect(order).toEqual(["unrepresentable", "override"]);
  });

  test("a returned schema replaces the whole literal", () => {
    expect(
      z.toJSONSchema(z.literal(["a", 1n]), {
        unrepresentable: () => ({ type: "string", pattern: "^\\d+$" }),
      })
    ).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "pattern": "^\\d+$",
        "type": "string",
      }
    `);

    // "any" keeps the existing per-value behavior: undefined dropped, bigint coerced
    expect(z.toJSONSchema(z.literal(["a", 1n, undefined]), { unrepresentable: () => "any" })).toEqual(
      z.toJSONSchema(z.literal(["a", 1n, undefined]), { unrepresentable: "any" })
    );
  });

  const dateToString: z.core.ToJSONSchemaParams["unrepresentable"] = ({ zodSchema }) =>
    zodSchema._zod.def.type === "date" ? { type: "string", format: "date-time" } : "throw";

  test("emits a valid OpenAPI 3.0 schema", async () => {
    const jsonSchema = z.toJSONSchema(z.object({ start: z.date() }), {
      target: "openapi-3.0",
      unrepresentable: dateToString,
    });
    expect(jsonSchema).toMatchInlineSnapshot(`
      {
        "additionalProperties": false,
        "properties": {
          "start": {
            "format": "date-time",
            "type": "string",
          },
        },
        "required": [
          "start",
        ],
        "type": "object",
      }
    `);
    await expect(validateOpenAPI30Schema(jsonSchema)).resolves.toBe(true);
  });

  test("the returned schema survives extraction into $defs", () => {
    const When = z.date().meta({ id: "When" });
    expect(
      z.toJSONSchema(z.object({ start: When, end: When }), { unrepresentable: dateToString })
    ).toMatchInlineSnapshot(`
      {
        "$defs": {
          "When": {
            "format": "date-time",
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "end": {
            "$ref": "#/$defs/When",
          },
          "start": {
            "$ref": "#/$defs/When",
          },
        },
        "required": [
          "start",
          "end",
        ],
        "type": "object",
      }
    `);
  });

  test("applies to dynamic catch values", () => {
    const schema = z.string().catch(() => {
      throw new Error("dynamic");
    });
    expect(
      z.toJSONSchema(schema, {
        unrepresentable: () => ({ default: "fallback" }),
      })
    ).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "default": "fallback",
        "type": "string",
      }
    `);
  });
});

describe("intersection folding", () => {
  const TARGETS = ["draft-2020-12", "draft-07", "draft-04", "openapi-3.0"] as const;
  const body = (schema: z.ZodType, params?: Parameters<typeof z.toJSONSchema>[1]) => {
    const { $schema, ...rest } = z.toJSONSchema(schema, params) as Record<string, unknown>;
    return rest;
  };

  test("two objects become one object", () => {
    expect(body(z.object({ name: z.string() }).and(z.object({ age: z.number() })))).toMatchInlineSnapshot(`
      {
        "additionalProperties": false,
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
  });

  test("the folded shape is identical on every target", () => {
    const schema = z.object({ name: z.string() }).and(z.object({ age: z.number() }));
    const bodies = TARGETS.map((target) => body(schema, { target }));
    for (const emitted of bodies) expect(emitted).toEqual(bodies[0]);
  });

  test("closed only when every member is closed", () => {
    expect(body(z.strictObject({ a: z.string() }).and(z.strictObject({ b: z.number() })))).toMatchObject({
      additionalProperties: false,
    });
    // A loose member keeps the intersection open, which is what the parser does: it merges both results, so the loose side's extra keys survive.
    expect(body(z.looseObject({ a: z.string() }).and(z.object({ b: z.number() })))).not.toHaveProperty(
      "additionalProperties"
    );
  });

  test("chained and nested intersections fold flat", () => {
    const chained = z
      .object({ a: z.string() })
      .and(z.object({ b: z.string() }))
      .and(z.object({ c: z.string() }));
    expect(body(chained)).toMatchObject({ properties: { a: {}, b: {}, c: {} }, required: ["a", "b", "c"] });
    const nested = z.object({ a: z.string() }).and(z.object({ b: z.string() }).and(z.object({ c: z.string() })));
    expect(body(nested)).toEqual(body(chained));
  });

  test("required is the union, and an optional key stays optional", () => {
    expect(body(z.object({ a: z.string().optional() }).and(z.object({ b: z.string() })))).toMatchObject({
      properties: { a: { type: "string" }, b: { type: "string" } },
      required: ["b"],
    });
  });

  test("a key both members declare has to satisfy both", () => {
    // identical declarations collapse
    expect(body(z.object({ k: z.string() }).and(z.object({ k: z.string() })))).toMatchObject({
      properties: { k: { type: "string" } },
    });
    // object declarations fold, matching the parser's deep merge
    expect(
      body(z.object({ k: z.object({ a: z.string() }) }).and(z.object({ k: z.object({ b: z.string() }) })))
    ).toMatchObject({
      properties: { k: { type: "object", properties: { a: {}, b: {} }, required: ["a", "b"] } },
    });
    // anything else stays an intersection one level down
    expect(body(z.object({ k: z.string() }).and(z.object({ k: z.number() })))).toMatchObject({
      properties: { k: { allOf: [{ type: "string" }, { type: "number" }] } },
    });
  });

  test("an intersection distributes over a union", () => {
    const schema = z
      .object({ name: z.string() })
      .and(
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("a"), value: z.string() }),
          z.object({ type: z.literal("b"), count: z.number() }),
        ])
      );
    expect(body(schema)).toMatchObject({
      oneOf: [
        { type: "object", properties: { name: {}, type: {}, value: {} }, additionalProperties: false },
        { type: "object", properties: { name: {}, type: {}, count: {} }, additionalProperties: false },
      ],
    });
    const inclusive = z
      .object({ name: z.string() })
      .and(z.union([z.object({ v: z.string() }), z.object({ c: z.number() })]));
    expect(body(inclusive)).toMatchObject({
      anyOf: [{ properties: { name: {}, v: {} } }, { properties: { name: {}, c: {} } }],
    });
  });

  test("input conversion has nothing to close", () => {
    expect(body(z.object({ a: z.string() }).and(z.object({ b: z.string() })), { io: "input" })).toEqual({
      type: "object",
      properties: { a: { type: "string" }, b: { type: "string" } },
      required: ["a", "b"],
    });
  });

  test("folds through a property and through z.lazy", () => {
    expect(body(z.object({ inner: z.object({ a: z.string() }).and(z.object({ b: z.string() })) }))).toMatchObject({
      properties: { inner: { type: "object", properties: { a: {}, b: {} } } },
    });
    const self: z.ZodType = z.lazy(() => z.object({ a: z.string() }).and(z.object({ next: z.optional(self) })));
    expect(body(self)).toMatchObject({ type: "object", properties: { a: {}, next: { $ref: "#" } } });
  });

  test("metadata on the intersection itself survives", () => {
    expect(
      body(
        z
          .object({ a: z.string() })
          .and(z.object({ b: z.string() }))
          .meta({ title: "T" })
      )
    ).toMatchObject({
      title: "T",
      type: "object",
      properties: { a: {}, b: {} },
    });
  });

  test("a catchall constrains the sibling's keys too", () => {
    // The catchall member does not declare `b`, so its `additionalProperties` is what it demands of `b`. Folding `b` into `properties` has to carry that demand across, or the key would escape it.
    const schema = z
      .object({ a: z.string() })
      .catchall(z.number())
      .and(z.object({ b: z.string() }));
    expect(body(schema)).toEqual({
      type: "object",
      properties: { a: { type: "string" }, b: { allOf: [{ type: "number" }, { type: "string" }] } },
      required: ["a", "b"],
      additionalProperties: { type: "number" },
    });
  });

  test("two catchalls both constrain the keys neither declares", () => {
    const schema = z
      .object({})
      .catchall(z.number())
      .and(z.object({}).catchall(z.number().min(0)));
    expect(body(schema)).toEqual({
      type: "object",
      properties: {},
      additionalProperties: { allOf: [{ type: "number" }, { type: "number", minimum: 0 }] },
    });
    expect(schema.safeParse({ zz: 5 }).success).toBe(true);
    expect(schema.safeParse({ zz: -1 }).success).toBe(false);
  });

  test("the emitted openness agrees with the parser for every pair of object modes", () => {
    const modes = {
      strip: (shape: z.ZodRawShape) => z.object(shape),
      strict: (shape: z.ZodRawShape) => z.strictObject(shape),
      loose: (shape: z.ZodRawShape) => z.looseObject(shape),
      catchall: (shape: z.ZodRawShape) => z.object(shape).catchall(z.number()),
    };
    const grid: Record<string, unknown> = {};
    for (const [leftName, left] of Object.entries(modes)) {
      for (const [rightName, right] of Object.entries(modes)) {
        const schema = left({ a: z.string() }).and(right({ b: z.number() }));
        const emitted = body(schema) as { additionalProperties?: unknown };
        grid[`${leftName} & ${rightName}`] = emitted.additionalProperties ?? "open";

        // Whatever the emitted keyword says, it has to agree with what the parser does with a key neither member declares.
        const parsed = schema.safeParse({ a: "s", b: 1, zz: 7 });
        const keepsUnknown = parsed.success && Object.prototype.hasOwnProperty.call(parsed.data, "zz");
        if (keepsUnknown) expect(emitted.additionalProperties).not.toBe(false);
      }
    }
    expect(grid).toMatchInlineSnapshot(`
      {
        "catchall & catchall": {
          "type": "number",
        },
        "catchall & loose": {
          "type": "number",
        },
        "catchall & strict": {
          "type": "number",
        },
        "catchall & strip": {
          "type": "number",
        },
        "loose & catchall": {
          "type": "number",
        },
        "loose & loose": "open",
        "loose & strict": "open",
        "loose & strip": "open",
        "strict & catchall": {
          "type": "number",
        },
        "strict & loose": "open",
        "strict & strict": false,
        "strict & strip": false,
        "strip & catchall": {
          "type": "number",
        },
        "strip & loose": "open",
        "strip & strict": false,
        "strip & strip": false,
      }
    `);
  });

  test("a __proto__ key stays an own property", () => {
    const folded = body(z.object({ ["__proto__"]: z.string() }).and(z.object({ b: z.number() }))) as any;
    expect(Object.prototype.hasOwnProperty.call(folded.properties, "__proto__")).toBe(true);
    expect(folded.required).toEqual(["__proto__", "b"]);
  });
});

describe("intersection folding declines", () => {
  // Every case here keeps the `allOf` it produces today. The fold only understands the four object keywords, so a member carrying anything else is left alone rather than having a constraint dropped or an annotation re-scoped.
  const allOf = (schema: z.ZodType, params?: Parameters<typeof z.toJSONSchema>[1]) =>
    (z.toJSONSchema(schema, params) as any).allOf;

  test("a member that is a reference keeps its reference", () => {
    const named = z.object({ a: z.string() }).meta({ id: "Named" });
    expect(allOf(named.and(z.object({ b: z.string() })))[0]).toEqual({ $ref: "#/$defs/Named" });

    const shared = z.object({ c: z.string() });
    const reused = z.toJSONSchema(z.object({ x: shared.and(z.object({ d: z.string() })), y: shared }), {
      reused: "ref",
    }) as any;
    expect(reused.properties.x.allOf[0]).toEqual({ $ref: "#/$defs/__schema0" });

    const cyclic: any = z.object({
      get next() {
        return z.optional(cyclic);
      },
      n: z.string(),
    });
    expect(allOf(cyclic.and(z.object({ m: z.string() })))[0].$ref).toBe("#/$defs/__schema0");
  });

  test("an annotated member keeps its place", () => {
    expect(
      allOf(
        z
          .object({ a: z.string() })
          .describe("A")
          .and(z.object({ b: z.string() }))
      )[0]
    ).toMatchObject({
      description: "A",
    });
  });

  test("members that are not plain objects are left alone", () => {
    expect(allOf(z.intersection(z.string().min(2), z.string().max(5)))).toHaveLength(2);
    expect(allOf(z.object({ a: z.string() }).and(z.nullable(z.object({ b: z.string() }))))).toHaveLength(2);
    expect(
      allOf(z.object({ label: z.string() }).and(z.looseRecord(z.string().regex(/^label:[a-z]{2}$/), z.string())))
    ).toHaveLength(2);
  });

  test("a shared member is never rewritten for its other uses", () => {
    const shared = z.object({ c: z.string() });
    const result = z.toJSONSchema(z.object({ x: shared.and(z.object({ d: z.string() })), y: shared })) as any;
    expect(result.properties.x).toMatchObject({ properties: { c: {}, d: {} }, additionalProperties: false });
    // `y` is the same Zod schema, emitted separately, and keeps the closedness it had on its own.
    expect(result.properties.y).toEqual({
      type: "object",
      properties: { c: { type: "string" } },
      required: ["c"],
      additionalProperties: false,
    });
  });

  test("registry conversion keeps its cross-references", () => {
    const registry = z.registry<{ id: string }>();
    const left = z.object({ p: z.string() });
    const right = z.object({ q: z.string() });
    registry.add(left, { id: "P" });
    registry.add(right, { id: "Q" });
    registry.add(left.and(right), { id: "PQ" });
    expect((z.toJSONSchema(registry) as any).schemas.PQ.allOf).toEqual([{ $ref: "P" }, { $ref: "Q" }]);
  });

  test("override still runs, and sees the intersection before it folds", () => {
    const schema = z.object({ a: z.string() }).and(z.object({ b: z.string() }));
    const result = z.toJSONSchema(schema, {
      override(ctx) {
        if ((ctx.jsonSchema as any).allOf) (ctx.jsonSchema as any).title = "intersection";
      },
    }) as any;
    expect(result).toMatchObject({ title: "intersection", type: "object", properties: { a: {}, b: {} } });
  });

  test("an override that writes object keywords wins over the fold", () => {
    // The override runs first, so anything it puts on the intersection is deliberate. Folding would overwrite it silently, so the fold stands down instead.
    const result = z.toJSONSchema(z.object({ a: z.string() }).and(z.object({ b: z.string() })), {
      override(ctx) {
        if ((ctx.jsonSchema as any).allOf) (ctx.jsonSchema as any).additionalProperties = true;
      },
    }) as any;
    expect(result.additionalProperties).toBe(true);
    expect(result.allOf).toHaveLength(2);
  });

  test("more than one union member is left alone rather than multiplied out", () => {
    // The second union lands among the members the first is distributed across, and a union is not an object, so every branch fails to fold and the whole intersection stands down.
    const schema = z
      .object({ a: z.string() })
      .and(z.union([z.object({ v: z.string() }), z.object({ w: z.string() })]))
      .and(z.union([z.object({ x: z.string() }), z.object({ y: z.string() })]));
    expect(allOf(schema)).toHaveLength(3);
  });
});
