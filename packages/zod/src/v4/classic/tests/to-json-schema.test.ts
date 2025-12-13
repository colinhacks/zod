import { Validator } from "@seriousme/openapi-schema-validator";
import { describe, expect, test } from "vitest";
import * as z from "zod/v4";
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
    // `console.error` should make `vitest` trow an unhandled error
    // printing the validation messages in consoles
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
        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$",
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
        "format": "time",
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
        "pattern": "^[cC][^\\s-]{8,}$",
        "type": "string",
      }
    `);
    // expect(z.toJSONSchema(z.regex(/asdf/))).toMatchInlineSnapshot();
    expect(z.toJSONSchema(z.emoji())).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "emoji",
        "pattern": "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
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
        "pattern": "^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$",
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
        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$",
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
        "format": "time",
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
            "pattern": "^.{10}dark",
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
            "pattern": "^.{10}dark",
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
        "anyOf": [
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

  test("discriminated unions", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("success"), data: z.string() }),
      z.object({ type: z.literal("error"), message: z.string() }),
    ]);
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$defs": {
          "__schema0": {
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "oneOf": [
          {
            "additionalProperties": false,
            "properties": {
              "data": {
                "$ref": "#/$defs/__schema0",
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
                "$ref": "#/$defs/__schema0",
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
        "allOf": [
          {
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
          },
          {
            "additionalProperties": false,
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

  test("tuple", () => {
    const schema = z.tuple([z.string(), z.number()]);
    expect(z.toJSONSchema(schema)).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
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
        "minItems": 3,
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
        "items": [
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
        "type": "array",
      }
    `);
  });

  test("tuple with rest draft-7 - issue #5151 regression test", () => {
    // This test addresses issue #5151: tuple with rest elements and ids
    // in draft-7 had incorrect internal path handling affecting complex scenarios
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
            "id": "primary",
            "type": "string",
          },
          "rest": {
            "id": "rest",
            "type": "number",
          },
        },
        "items": [
          {
            "$ref": "#/definitions/primary",
          },
        ],
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
        "$defs": {
          "__schema0": {
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": {
          "$ref": "#/$defs/__schema0",
        },
        "properties": {
          "name": {
            "$ref": "#/$defs/__schema0",
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
        "$defs": {
          "__schema0": {
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "nonoptional": {
            "$ref": "#/$defs/__schema0",
          },
          "optional": {
            "$ref": "#/$defs/__schema0",
          },
          "required": {
            "$ref": "#/$defs/__schema0",
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
        "$defs": {
          "__schema0": {
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": {
          "$ref": "#/$defs/__schema0",
        },
        "properties": {
          "name": {
            "$ref": "#/$defs/__schema0",
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
            "$ref": "#/$defs/__schema0"
          },
          "files": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "$ref": "#/$defs/__schema0"
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
        "additionalProperties": false,
        "$defs": {
          "__schema0": {
            "type": "string"
          }
        }
      }"
    `
    );
  });
});

test("override", () => {
  const schema = z.z.toJSONSchema(z.string(), {
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
  z.z.toJSONSchema(schema, {
    unrepresentable: "any",
    io: "input",
    override(_) {
      overrideCount++;
    },
  });

  expect(overrideCount).toBe(6);
});

test("override with refs", () => {
  const a = z.string().optional();
  const result = z.z.toJSONSchema(a, {
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
  z.z.toJSONSchema(schema, {
    override(ctx) {
      if (ctx.zodSchema._zod.def.type === "union") {
        unionSchema = ctx.jsonSchema;
      }
    },
  });

  expect(unionSchema).toMatchInlineSnapshot(`
    {
      "anyOf": [
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

  const a = z.z.toJSONSchema(mySchema);
  expect(a).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "number",
    }
  `);
  // => { type: "number" }

  const b = z.z.toJSONSchema(mySchema, { io: "input" });
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

  const result = z.z.toJSONSchema(External, {
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
  const result = z.z.toJSONSchema(
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
          "id": "age",
          "type": "number",
        },
        "name": {
          "id": "name",
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

test("unrepresentable literal values are ignored", () => {
  const a = z.z.toJSONSchema(z.literal(["hello", null, 5, BigInt(1324), undefined]), { unrepresentable: "any" });
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

  const b = z.z.toJSONSchema(z.literal([undefined, null, 5, BigInt(1324)]), {
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

  const c = z.z.toJSONSchema(z.literal([undefined]), {
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

  const a = z.z.toJSONSchema(
    z.object({
      current: jobId.describe("Current job"),
      previous: jobId.describe("Previous job"),
    })
  );
  expect(a).toMatchInlineSnapshot(`
    {
      "$defs": {
        "jobId": {
          "id": "jobId",
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

test("overwrite id", () => {
  const jobId = z.string().meta({ id: "aaa" });

  const a = z.z.toJSONSchema(
    z.object({
      current: jobId,
      previous: jobId.meta({ id: "bbb" }),
    })
  );
  expect(a).toMatchInlineSnapshot(`
    {
      "$defs": {
        "aaa": {
          "id": "aaa",
          "type": "string",
        },
        "bbb": {
          "$ref": "#/$defs/aaa",
          "id": "bbb",
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

  const b = z.z.toJSONSchema(
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
          "id": "aaa",
          "type": "string",
        },
        "ccc": {
          "$ref": "#/$defs/aaa",
          "id": "ccc",
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

  const a = z.z.toJSONSchema(
    z.object({
      d: field.describe("d"),
      e: field.describe("e"),
    })
  );
  expect(a).toMatchInlineSnapshot(`
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

  const b = z.z.toJSONSchema(
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

  const result = z.z.toJSONSchema(A);
  expect(result).toMatchInlineSnapshot(`
    {
      "$defs": {
        "B": {
          "additionalProperties": false,
          "id": "B",
          "properties": {
            "a": {
              "$ref": "#",
            },
            "name": {
              "$ref": "#/$defs/__schema0",
            },
          },
          "readOnly": true,
          "required": [
            "name",
            "a",
          ],
          "type": "object",
        },
        "__schema0": {
          "type": "string",
        },
      },
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "additionalProperties": false,
      "id": "A",
      "properties": {
        "b": {
          "$ref": "#/$defs/B",
        },
        "name": {
          "$ref": "#/$defs/__schema0",
        },
      },
      "readOnly": true,
      "required": [
        "name",
        "b",
      ],
      "type": "object",
    }
  `);
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

  const result = z.z.toJSONSchema(myRegistry, {
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
              "$ref": "https://example.com/__shared.json#/$defs/schema0",
            },
            "title": {
              "$ref": "https://example.com/__shared.json#/$defs/schema0",
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
              "$ref": "https://example.com/__shared.json#/$defs/schema0",
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
        "__shared": {
          "$defs": {
            "schema0": {
              "type": "string",
            },
          },
        },
      },
    }
  `);
});

test("_ref", () => {
  // const a = z.promise(z.string().describe("a"));
  const a = z.z.toJSONSchema(z.promise(z.string().describe("a")));
  expect(a).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "description": "a",
      "type": "string",
    }
  `);

  const b = z.z.toJSONSchema(z.lazy(() => z.string().describe("a")));
  expect(b).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "description": "a",
      "type": "string",
    }
  `);

  const c = z.z.toJSONSchema(z.optional(z.string().describe("a")));
  expect(c).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "description": "a",
      "type": "string",
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
      "$defs": {
        "__schema0": {
          "type": "string",
        },
      },
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "properties": {
        "a": {
          "$ref": "#/$defs/__schema0",
        },
        "b": {
          "$ref": "#/$defs/__schema0",
        },
        "c": {
          "$ref": "#/$defs/__schema0",
          "default": "hello",
        },
        "d": {
          "anyOf": [
            {
              "$ref": "#/$defs/__schema0",
            },
            {
              "type": "null",
            },
          ],
        },
        "e": {
          "$ref": "#/$defs/__schema0",
          "default": "hello",
        },
        "f": {
          "$ref": "#/$defs/__schema0",
          "default": "hello",
        },
        "g": {
          "not": {},
        },
        "h": {
          "anyOf": [
            {
              "$ref": "#/$defs/__schema0",
            },
            {
              "default": 2,
              "type": "number",
            },
          ],
        },
        "i": {
          "anyOf": [
            {
              "$ref": "#/$defs/__schema0",
            },
            {
              "$ref": "#/$defs/__schema0",
            },
          ],
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
          "$ref": "#/$defs/__schema0",
        },
        "c": {
          "$ref": "#/$defs/__schema0",
          "default": "hello",
        },
        "d": {
          "anyOf": [
            {
              "$ref": "#/$defs/__schema0",
            },
            {
              "type": "null",
            },
          ],
        },
        "e": {
          "$ref": "#/$defs/__schema0",
        },
        "f": {
          "$ref": "#/$defs/__schema0",
          "default": "hello",
        },
        "g": {
          "not": {},
        },
        "h": {
          "anyOf": [
            {
              "$ref": "#/$defs/__schema0",
            },
            {
              "default": 2,
              "type": "number",
            },
          ],
        },
        "i": {
          "anyOf": [
            {
              "$ref": "#/$defs/__schema0",
            },
            {
              "$ref": "#/$defs/__schema0",
            },
          ],
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

  const i = z.z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
  expect(i).toMatchInlineSnapshot(`
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "examples": [
        "test",
      ],
      "type": "string",
    }
  `);
  const o = z.z.toJSONSchema(schema, { io: "output", unrepresentable: "any" });
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
//   expect(z.z.toJSONSchema(z.number().int())).toMatchInlineSnapshot(`
//     {
//       "maximum": 9007199254740991,
//       "minimum": -9007199254740991,
//       "type": "integer",
//     }
//   `);
//   expect(z.z.toJSONSchema(z.int())).toMatchInlineSnapshot(`
//     {
//       "maximum": 9007199254740991,
//       "minimum": -9007199254740991,
//       "type": "integer",
//     }
//   `);
//   expect(z.z.toJSONSchema(z.int().positive())).toMatchInlineSnapshot(`
//     {
//       "exclusiveMinimum": 0,
//       "maximum": 9007199254740991,
//       "minimum": -9007199254740991,
//       "type": "integer",
//     }
//   `);
//   expect(z.z.toJSONSchema(z.int().nonnegative())).toMatchInlineSnapshot(`
//     {
//       "maximum": 9007199254740991,
//       "minimum": 0,
//       "type": "integer",
//     }
//   `);
//   expect(z.z.toJSONSchema(z.int().gt(0))).toMatchInlineSnapshot(`
//     {
//       "exclusiveMinimum": 0,
//       "maximum": 9007199254740991,
//       "minimum": -9007199254740991,
//       "type": "integer",
//     }
//   `);
//   expect(z.z.toJSONSchema(z.int().gte(0))).toMatchInlineSnapshot(`
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
      "allOf": [
        {
          "additionalProperties": false,
          "properties": {
            "testNum": {
              "type": "number",
            },
          },
          "required": [
            "testNum",
          ],
          "type": "object",
        },
        {
          "additionalProperties": false,
          "properties": {
            "testStr": {
              "type": "string",
            },
          },
          "required": [
            "testStr",
          ],
          "type": "object",
        },
        {
          "additionalProperties": false,
          "properties": {
            "testBool": {
              "type": "boolean",
            },
          },
          "required": [
            "testBool",
          ],
          "type": "object",
        },
      ],
      "description": "123",
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
          "contentEncoding": "binary",
          "contentMediaType": "image/png",
          "format": "binary",
          "maxLength": 10000,
          "minLength": 1000,
          "type": "string",
        },
        {
          "contentEncoding": "binary",
          "contentMediaType": "image/jpg",
          "format": "binary",
          "maxLength": 10000,
          "minLength": 1000,
          "type": "string",
        },
      ],
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

// ============================================================================
// COMPREHENSIVE CYCLE DETECTION TESTS
// ============================================================================

describe("cycles: throw - complex patterns", () => {
  test("cycle through union type", () => {
    const Node = z.object({
      value: z.string(),
      get child() {
        return z.union([Node, z.null()]);
      },
    });

    expect(() => z.toJSONSchema(Node, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cycle detected: #/properties/child/anyOf/0/<root>

      Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
    `);
  });

  test("cycle through intersection type", () => {
    const Base = z.object({ id: z.string() });
    const Node = z.object({
      name: z.string(),
      get child() {
        return z.intersection(Base, Node);
      },
    });

    expect(() => z.toJSONSchema(Node, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cycle detected: #/properties/child/allOf/1/<root>

      Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
    `);
  });

  test("cycle through tuple", () => {
    const Node = z.object({
      value: z.number(),
      get pair() {
        return z.tuple([z.string(), Node]);
      },
    });

    expect(() => z.toJSONSchema(Node, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cycle detected: #/properties/pair/prefixItems/1/<root>

      Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
    `);
  });

  test("cycle through record values", () => {
    const Node = z.object({
      name: z.string(),
      get children() {
        return z.record(z.string(), Node);
      },
    });

    expect(() => z.toJSONSchema(Node, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cycle detected: #/properties/children/additionalProperties/<root>

      Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
    `);
  });

  test("deep nesting - 3 levels before cycle", () => {
    const Deep = z.object({
      level1: z.object({
        level2: z.object({
          get level3() {
            return Deep;
          },
        }),
      }),
    });

    expect(() => z.toJSONSchema(Deep, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cycle detected: #/properties/level1/properties/level2/properties/level3/<root>

      Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
    `);
  });

  test("cycle through nullable wrapper", () => {
    const Node = z.object({
      value: z.string(),
      get next() {
        return Node.nullable();
      },
    });

    expect(() => z.toJSONSchema(Node, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cycle detected: #/properties/next/<root>

      Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
    `);
  });

  test("cycle through optional wrapper", () => {
    const Node = z.object({
      value: z.string(),
      get next() {
        return Node.optional();
      },
    });

    expect(() => z.toJSONSchema(Node, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cycle detected: #/properties/next/<root>

      Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
    `);
  });

  test("three-way cycle: A -> B -> C -> A", () => {
    const A = z.object({
      name: z.literal("A"),
      get b() {
        return B;
      },
    });

    const B = z.object({
      name: z.literal("B"),
      get c() {
        return C;
      },
    });

    const C = z.object({
      name: z.literal("C"),
      get a() {
        return A;
      },
    });

    expect(() => z.toJSONSchema(A, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cycle detected: #/properties/b/properties/c/properties/a/<root>

      Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
    `);
  });

  test("cycle through z.lazy()", () => {
    interface Node {
      value: string;
      children: Node[];
    }

    const Node: z.ZodType<Node> = z.object({
      value: z.string(),
      children: z.array(z.lazy(() => Node)),
    });

    expect(() => z.toJSONSchema(Node, { cycles: "throw" })).toThrowErrorMatchingInlineSnapshot(`
      [Error: Cycle detected: #/properties/children/items/<root>

      Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.]
    `);
  });
});

describe("cycles: ref - default behavior", () => {
  test("self-recursive object produces $ref to root", () => {
    const Category = z.object({
      name: z.string(),
      get subcategories() {
        return z.array(Category);
      },
    });

    const result = z.toJSONSchema(Category);
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

  test("mutually recursive schemas with meta ids produce named $defs", () => {
    const Author = z
      .object({
        name: z.string(),
        get books() {
          return z.array(Book);
        },
      })
      .meta({ id: "Author" });

    const Book = z
      .object({
        title: z.string(),
        get author() {
          return Author;
        },
      })
      .meta({ id: "Book" });

    const result = z.toJSONSchema(Author);
    expect(result).toMatchInlineSnapshot(`
      {
        "$defs": {
          "Book": {
            "additionalProperties": false,
            "id": "Book",
            "properties": {
              "author": {
                "$ref": "#",
              },
              "title": {
                "$ref": "#/$defs/__schema0",
              },
            },
            "required": [
              "title",
              "author",
            ],
            "type": "object",
          },
          "__schema0": {
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "id": "Author",
        "properties": {
          "books": {
            "items": {
              "$ref": "#/$defs/Book",
            },
            "type": "array",
          },
          "name": {
            "$ref": "#/$defs/__schema0",
          },
        },
        "required": [
          "name",
          "books",
        ],
        "type": "object",
      }
    `);
  });

  test("deep nested cycle produces correct $ref path", () => {
    const Root = z.object({
      level1: z.object({
        level2: z.object({
          get backToRoot() {
            return Root;
          },
        }),
      }),
    });

    const result = z.toJSONSchema(Root);
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "level1": {
            "additionalProperties": false,
            "properties": {
              "level2": {
                "additionalProperties": false,
                "properties": {
                  "backToRoot": {
                    "$ref": "#",
                  },
                },
                "required": [
                  "backToRoot",
                ],
                "type": "object",
              },
            },
            "required": [
              "level2",
            ],
            "type": "object",
          },
        },
        "required": [
          "level1",
        ],
        "type": "object",
      }
    `);
  });

  test("cycle through union options", () => {
    const Node = z.object({
      value: z.number(),
      get child() {
        return z.union([Node, z.null()]);
      },
    });

    const result = z.toJSONSchema(Node);
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "child": {
            "anyOf": [
              {
                "$ref": "#",
              },
              {
                "type": "null",
              },
            ],
          },
          "value": {
            "type": "number",
          },
        },
        "required": [
          "value",
          "child",
        ],
        "type": "object",
      }
    `);
  });

  test("cycle through intersection", () => {
    const Base = z.object({ id: z.string() });
    const Node = z.object({
      name: z.string(),
      get child() {
        return z.intersection(Base, Node);
      },
    });

    const result = z.toJSONSchema(Node);
    expect(result).toMatchInlineSnapshot(`
      {
        "$defs": {
          "__schema0": {
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "child": {
            "allOf": [
              {
                "additionalProperties": false,
                "properties": {
                  "id": {
                    "$ref": "#/$defs/__schema0",
                  },
                },
                "required": [
                  "id",
                ],
                "type": "object",
              },
              {
                "$ref": "#",
              },
            ],
          },
          "name": {
            "$ref": "#/$defs/__schema0",
          },
        },
        "required": [
          "name",
          "child",
        ],
        "type": "object",
      }
    `);
  });

  test("cycle through tuple elements", () => {
    const Node = z.object({
      value: z.number(),
      get pair() {
        return z.tuple([z.string(), Node]);
      },
    });

    const result = z.toJSONSchema(Node);
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "pair": {
            "prefixItems": [
              {
                "type": "string",
              },
              {
                "$ref": "#",
              },
            ],
            "type": "array",
          },
          "value": {
            "type": "number",
          },
        },
        "required": [
          "value",
          "pair",
        ],
        "type": "object",
      }
    `);
  });

  test("cycle through record values", () => {
    const Node = z.object({
      name: z.string(),
      get children() {
        return z.record(z.string(), Node);
      },
    });

    const result = z.toJSONSchema(Node);
    expect(result).toMatchInlineSnapshot(`
      {
        "$defs": {
          "__schema0": {
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "children": {
            "additionalProperties": {
              "$ref": "#",
            },
            "propertyNames": {
              "$ref": "#/$defs/__schema0",
            },
            "type": "object",
          },
          "name": {
            "$ref": "#/$defs/__schema0",
          },
        },
        "required": [
          "name",
          "children",
        ],
        "type": "object",
      }
    `);
  });

  test("three-way cycle: A -> B -> C -> A produces correct refs", () => {
    const A = z
      .object({
        type: z.literal("A"),
        get b() {
          return B;
        },
      })
      .meta({ id: "SchemaA" });

    const B = z
      .object({
        type: z.literal("B"),
        get c() {
          return C;
        },
      })
      .meta({ id: "SchemaB" });

    const C = z
      .object({
        type: z.literal("C"),
        get a() {
          return A;
        },
      })
      .meta({ id: "SchemaC" });

    const result = z.toJSONSchema(A);
    expect(result).toMatchInlineSnapshot(`
      {
        "$defs": {
          "SchemaB": {
            "additionalProperties": false,
            "id": "SchemaB",
            "properties": {
              "c": {
                "$ref": "#/$defs/SchemaC",
              },
              "type": {
                "const": "B",
                "type": "string",
              },
            },
            "required": [
              "type",
              "c",
            ],
            "type": "object",
          },
          "SchemaC": {
            "additionalProperties": false,
            "id": "SchemaC",
            "properties": {
              "a": {
                "$ref": "#",
              },
              "type": {
                "const": "C",
                "type": "string",
              },
            },
            "required": [
              "type",
              "a",
            ],
            "type": "object",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "id": "SchemaA",
        "properties": {
          "b": {
            "$ref": "#/$defs/SchemaB",
          },
          "type": {
            "const": "A",
            "type": "string",
          },
        },
        "required": [
          "type",
          "b",
        ],
        "type": "object",
      }
    `);
  });

  test("cycle with nullable wrapper", () => {
    const LinkedList = z.object({
      value: z.number(),
      get next() {
        return LinkedList.nullable();
      },
    });

    const result = z.toJSONSchema(LinkedList);
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "next": {
            "anyOf": [
              {
                "$ref": "#",
              },
              {
                "type": "null",
              },
            ],
          },
          "value": {
            "type": "number",
          },
        },
        "required": [
          "value",
          "next",
        ],
        "type": "object",
      }
    `);
  });

  test("cycle with optional wrapper", () => {
    const TreeNode = z.object({
      value: z.string(),
      get parent() {
        return TreeNode.optional();
      },
    });

    const result = z.toJSONSchema(TreeNode);
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "parent": {
            "$ref": "#",
          },
          "value": {
            "type": "string",
          },
        },
        "required": [
          "value",
        ],
        "type": "object",
      }
    `);
  });

  test("cycle combined with reused: ref extracts both cycles and reused schemas", () => {
    const Shared = z.object({
      data: z.string(),
    });

    const Node = z.object({
      meta1: Shared,
      meta2: Shared, // reused
      get children() {
        return z.array(Node);
      },
    });

    const result = z.toJSONSchema(Node, { reused: "ref" });
    expect(result).toMatchInlineSnapshot(`
      {
        "$defs": {
          "__schema0": {
            "additionalProperties": false,
            "properties": {
              "data": {
                "type": "string",
              },
            },
            "required": [
              "data",
            ],
            "type": "object",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "children": {
            "items": {
              "$ref": "#",
            },
            "type": "array",
          },
          "meta1": {
            "$ref": "#/$defs/__schema0",
          },
          "meta2": {
            "$ref": "#/$defs/__schema0",
          },
        },
        "required": [
          "meta1",
          "meta2",
          "children",
        ],
        "type": "object",
      }
    `);
  });

  test("multiple independent cycles in same schema", () => {
    const TypeA = z.object({
      name: z.literal("A"),
      get self() {
        return TypeA;
      },
    });

    const TypeB = z.object({
      name: z.literal("B"),
      get self() {
        return TypeB;
      },
    });

    const Container = z.object({
      get a() {
        return TypeA;
      },
      get b() {
        return TypeB;
      },
    });

    const result = z.toJSONSchema(Container);
    expect(result).toMatchInlineSnapshot(`
      {
        "$defs": {
          "__schema0": {
            "additionalProperties": false,
            "properties": {
              "name": {
                "const": "A",
                "type": "string",
              },
              "self": {
                "$ref": "#/$defs/__schema0",
              },
            },
            "required": [
              "name",
              "self",
            ],
            "type": "object",
          },
          "__schema1": {
            "additionalProperties": false,
            "properties": {
              "name": {
                "const": "B",
                "type": "string",
              },
              "self": {
                "$ref": "#/$defs/__schema1",
              },
            },
            "required": [
              "name",
              "self",
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
            "$ref": "#/$defs/__schema1",
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

  test("cycle through z.lazy() with type annotation", () => {
    interface TreeNode {
      value: string;
      children: TreeNode[];
    }

    const TreeNodeSchema: z.ZodType<TreeNode> = z.object({
      value: z.string(),
      children: z.array(z.lazy(() => TreeNodeSchema)),
    });

    const result = z.toJSONSchema(TreeNodeSchema);
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "children": {
            "items": {
              "$ref": "#",
            },
            "type": "array",
          },
          "value": {
            "type": "string",
          },
        },
        "required": [
          "value",
          "children",
        ],
        "type": "object",
      }
    `);
  });

  test("complex nested structure with multiple cycle entry points", () => {
    const Inner = z.object({
      id: z.string(),
      get parent() {
        return Outer;
      },
    });

    const Outer = z.object({
      name: z.string(),
      get inner() {
        return Inner;
      },
      get sibling() {
        return Outer.optional();
      },
    });

    const result = z.toJSONSchema(Outer);
    expect(result).toMatchInlineSnapshot(`
      {
        "$defs": {
          "__schema0": {
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "inner": {
            "additionalProperties": false,
            "properties": {
              "id": {
                "$ref": "#/$defs/__schema0",
              },
              "parent": {
                "$ref": "#",
              },
            },
            "required": [
              "id",
              "parent",
            ],
            "type": "object",
          },
          "name": {
            "$ref": "#/$defs/__schema0",
          },
          "sibling": {
            "$ref": "#",
          },
        },
        "required": [
          "name",
          "inner",
        ],
        "type": "object",
      }
    `);
  });

  test("draft-7 target uses definitions instead of $defs", () => {
    const Node = z
      .object({
        value: z.string(),
        get child() {
          return Node;
        },
      })
      .meta({ id: "Node" });

    const Wrapper = z.object({
      get root() {
        return Node;
      },
    });

    const result = z.toJSONSchema(Wrapper, { target: "draft-7" });
    expect(result).toMatchInlineSnapshot(`
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "additionalProperties": false,
        "definitions": {
          "Node": {
            "additionalProperties": false,
            "id": "Node",
            "properties": {
              "child": {
                "$ref": "#/definitions/Node",
              },
              "value": {
                "type": "string",
              },
            },
            "required": [
              "value",
              "child",
            ],
            "type": "object",
          },
        },
        "properties": {
          "root": {
            "$ref": "#/definitions/Node",
          },
        },
        "required": [
          "root",
        ],
        "type": "object",
      }
    `);
  });
});

describe("registry + cycles", () => {
  test("simple registry with mutually recursive schemas", () => {
    const myRegistry = z.registry<{ id: string }>();

    const User = z.object({
      name: z.string(),
      get posts() {
        return z.array(Post);
      },
    });

    const Post = z.object({
      title: z.string(),
      get author() {
        return User;
      },
    });

    myRegistry.add(User, { id: "User" });
    myRegistry.add(Post, { id: "Post" });

    const result = z.toJSONSchema(myRegistry);
    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Post": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "author": {
                "$ref": "User",
              },
              "title": {
                "$ref": "__shared#/$defs/schema0",
              },
            },
            "required": [
              "title",
              "author",
            ],
            "type": "object",
          },
          "User": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "name": {
                "$ref": "__shared#/$defs/schema0",
              },
              "posts": {
                "items": {
                  "$ref": "Post",
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
          "__shared": {
            "$defs": {
              "schema0": {
                "type": "string",
              },
            },
          },
        },
      }
    `);
  });

  test("registry with self-recursive schema", () => {
    const myRegistry = z.registry<{ id: string }>();

    const Category = z.object({
      name: z.string(),
      get subcategories() {
        return z.array(Category);
      },
    });

    myRegistry.add(Category, { id: "Category" });

    const result = z.toJSONSchema(myRegistry);
    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Category": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "name": {
                "type": "string",
              },
              "subcategories": {
                "items": {
                  "$ref": "Category",
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
      }
    `);
  });

  test("registry with external URI generation and cycles", () => {
    const myRegistry = z.registry<{ id: string }>();

    const Author = z.object({
      name: z.string(),
      email: z.string().email(),
      get books() {
        return z.array(Book);
      },
    });

    const Book = z.object({
      title: z.string(),
      isbn: z.string(),
      get author() {
        return Author;
      },
      get relatedBooks() {
        return z.array(Book);
      },
    });

    myRegistry.add(Author, { id: "Author" });
    myRegistry.add(Book, { id: "Book" });

    const result = z.toJSONSchema(myRegistry, {
      uri: (id) => `https://api.library.com/schemas/${id}.json`,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Author": {
            "$id": "https://api.library.com/schemas/Author.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "books": {
                "items": {
                  "$ref": "https://api.library.com/schemas/Book.json",
                },
                "type": "array",
              },
              "email": {
                "format": "email",
                "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
                "type": "string",
              },
              "name": {
                "$ref": "https://api.library.com/schemas/__shared.json#/$defs/schema0",
              },
            },
            "required": [
              "name",
              "email",
              "books",
            ],
            "type": "object",
          },
          "Book": {
            "$id": "https://api.library.com/schemas/Book.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "author": {
                "$ref": "https://api.library.com/schemas/Author.json",
              },
              "isbn": {
                "$ref": "https://api.library.com/schemas/__shared.json#/$defs/schema0",
              },
              "relatedBooks": {
                "items": {
                  "$ref": "https://api.library.com/schemas/Book.json",
                },
                "type": "array",
              },
              "title": {
                "$ref": "https://api.library.com/schemas/__shared.json#/$defs/schema0",
              },
            },
            "required": [
              "title",
              "isbn",
              "author",
              "relatedBooks",
            ],
            "type": "object",
          },
          "__shared": {
            "$defs": {
              "schema0": {
                "type": "string",
              },
            },
          },
        },
      }
    `);
  });

  test("registry with 3+ schemas in cycle: A -> B -> C -> A", () => {
    const myRegistry = z.registry<{ id: string }>();

    const Department = z.object({
      name: z.string(),
      get employees() {
        return z.array(Employee);
      },
    });

    const Employee = z.object({
      name: z.string(),
      get projects() {
        return z.array(Project);
      },
    });

    const Project = z.object({
      title: z.string(),
      get department() {
        return Department;
      },
    });

    myRegistry.add(Department, { id: "Department" });
    myRegistry.add(Employee, { id: "Employee" });
    myRegistry.add(Project, { id: "Project" });

    const result = z.toJSONSchema(myRegistry, {
      uri: (id) => `https://corp.com/api/${id}`,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Department": {
            "$id": "https://corp.com/api/Department",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "employees": {
                "items": {
                  "$ref": "https://corp.com/api/Employee",
                },
                "type": "array",
              },
              "name": {
                "$ref": "https://corp.com/api/__shared#/$defs/schema0",
              },
            },
            "required": [
              "name",
              "employees",
            ],
            "type": "object",
          },
          "Employee": {
            "$id": "https://corp.com/api/Employee",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "name": {
                "$ref": "https://corp.com/api/__shared#/$defs/schema0",
              },
              "projects": {
                "items": {
                  "$ref": "https://corp.com/api/Project",
                },
                "type": "array",
              },
            },
            "required": [
              "name",
              "projects",
            ],
            "type": "object",
          },
          "Project": {
            "$id": "https://corp.com/api/Project",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "department": {
                "$ref": "https://corp.com/api/Department",
              },
              "title": {
                "$ref": "https://corp.com/api/__shared#/$defs/schema0",
              },
            },
            "required": [
              "title",
              "department",
            ],
            "type": "object",
          },
          "__shared": {
            "$defs": {
              "schema0": {
                "type": "string",
              },
            },
          },
        },
      }
    `);
  });

  test("registry with mixed: some schemas registered, some not, with cycles and reused", () => {
    const myRegistry = z.registry<{ id: string }>();

    // Unregistered shared schema
    const Address = z.object({
      street: z.string(),
      city: z.string(),
    });

    const Person = z.object({
      name: z.string(),
      address: Address,
      get employer() {
        return Company.optional();
      },
    });

    const Company = z.object({
      name: z.string(),
      address: Address, // reused unregistered schema
      get employees() {
        return z.array(Person);
      },
    });

    myRegistry.add(Person, { id: "Person" });
    myRegistry.add(Company, { id: "Company" });

    // With reused: "ref", shared schemas should go to __shared
    const result = z.toJSONSchema(myRegistry, {
      uri: (id) => `https://example.com/${id}`,
      reused: "ref",
    });

    // Address should end up in __shared since it's not registered but reused
    expect(result.schemas.__shared).toBeDefined();
    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Company": {
            "$id": "https://example.com/Company",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "address": {
                "$ref": "https://example.com/__shared#/$defs/schema1",
              },
              "employees": {
                "items": {
                  "$ref": "https://example.com/Person",
                },
                "type": "array",
              },
              "name": {
                "$ref": "https://example.com/__shared#/$defs/schema0",
              },
            },
            "required": [
              "name",
              "address",
              "employees",
            ],
            "type": "object",
          },
          "Person": {
            "$id": "https://example.com/Person",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "address": {
                "$ref": "https://example.com/__shared#/$defs/schema1",
              },
              "employer": {
                "$ref": "https://example.com/Company",
              },
              "name": {
                "$ref": "https://example.com/__shared#/$defs/schema0",
              },
            },
            "required": [
              "name",
              "address",
            ],
            "type": "object",
          },
          "__shared": {
            "$defs": {
              "schema0": {
                "type": "string",
              },
              "schema1": {
                "additionalProperties": false,
                "properties": {
                  "city": {
                    "$ref": "https://example.com/__shared#/$defs/schema0",
                  },
                  "street": {
                    "$ref": "https://example.com/__shared#/$defs/schema0",
                  },
                },
                "required": [
                  "street",
                  "city",
                ],
                "type": "object",
              },
            },
          },
        },
      }
    `);
  });

  test("registry with deeply nested cycles", () => {
    const myRegistry = z.registry<{ id: string }>();

    const Root = z.object({
      name: z.string(),
      nested: z.object({
        level1: z.object({
          level2: z.object({
            get backToRoot() {
              return Root;
            },
          }),
        }),
      }),
    });

    myRegistry.add(Root, { id: "Root" });

    const result = z.toJSONSchema(myRegistry, {
      uri: (id) => `https://deep.com/${id}`,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Root": {
            "$id": "https://deep.com/Root",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "name": {
                "type": "string",
              },
              "nested": {
                "additionalProperties": false,
                "properties": {
                  "level1": {
                    "additionalProperties": false,
                    "properties": {
                      "level2": {
                        "additionalProperties": false,
                        "properties": {
                          "backToRoot": {
                            "$ref": "https://deep.com/Root",
                          },
                        },
                        "required": [
                          "backToRoot",
                        ],
                        "type": "object",
                      },
                    },
                    "required": [
                      "level2",
                    ],
                    "type": "object",
                  },
                },
                "required": [
                  "level1",
                ],
                "type": "object",
              },
            },
            "required": [
              "name",
              "nested",
            ],
            "type": "object",
          },
        },
      }
    `);
  });

  test("registry with multiple entry points into same cycle", () => {
    const myRegistry = z.registry<{ id: string }>();

    const Node = z.object({
      value: z.string(),
      get left() {
        return Node.optional();
      },
      get right() {
        return Node.optional();
      },
    });

    // Two different schemas that reference the same cyclic Node
    const TreeA = z.object({
      name: z.literal("TreeA"),
      get root() {
        return Node;
      },
    });

    const TreeB = z.object({
      name: z.literal("TreeB"),
      get root() {
        return Node;
      },
    });

    myRegistry.add(Node, { id: "Node" });
    myRegistry.add(TreeA, { id: "TreeA" });
    myRegistry.add(TreeB, { id: "TreeB" });

    const result = z.toJSONSchema(myRegistry, {
      uri: (id) => `https://trees.io/${id}`,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Node": {
            "$id": "https://trees.io/Node",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "left": {
                "$ref": "https://trees.io/Node",
              },
              "right": {
                "$ref": "https://trees.io/Node",
              },
              "value": {
                "type": "string",
              },
            },
            "required": [
              "value",
            ],
            "type": "object",
          },
          "TreeA": {
            "$id": "https://trees.io/TreeA",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "name": {
                "const": "TreeA",
                "type": "string",
              },
              "root": {
                "$ref": "https://trees.io/Node",
              },
            },
            "required": [
              "name",
              "root",
            ],
            "type": "object",
          },
          "TreeB": {
            "$id": "https://trees.io/TreeB",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "name": {
                "const": "TreeB",
                "type": "string",
              },
              "root": {
                "$ref": "https://trees.io/Node",
              },
            },
            "required": [
              "name",
              "root",
            ],
            "type": "object",
          },
        },
      }
    `);
  });

  test("registry with cycles through discriminated union", () => {
    const myRegistry = z.registry<{ id: string }>();

    const LeafNode = z.object({
      type: z.literal("leaf"),
      value: z.number(),
    });

    // Use z.lazy for forward reference to TreeNode
    type TreeNodeType = z.infer<typeof LeafNode> | { type: "branch"; children: TreeNodeType[] };

    const BranchNode = z.object({
      type: z.literal("branch"),
      children: z.array(z.lazy((): z.ZodType<TreeNodeType> => TreeNode)),
    });

    const TreeNode: z.ZodType<TreeNodeType> = z.discriminatedUnion("type", [LeafNode, BranchNode]);

    myRegistry.add(LeafNode, { id: "LeafNode" });
    myRegistry.add(BranchNode, { id: "BranchNode" });
    myRegistry.add(TreeNode, { id: "TreeNode" });

    const result = z.toJSONSchema(myRegistry, {
      uri: (id) => `https://ast.dev/${id}`,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "BranchNode": {
            "$id": "https://ast.dev/BranchNode",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "children": {
                "items": {
                  "$ref": "https://ast.dev/TreeNode",
                },
                "type": "array",
              },
              "type": {
                "const": "branch",
                "type": "string",
              },
            },
            "required": [
              "type",
              "children",
            ],
            "type": "object",
          },
          "LeafNode": {
            "$id": "https://ast.dev/LeafNode",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "type": {
                "const": "leaf",
                "type": "string",
              },
              "value": {
                "type": "number",
              },
            },
            "required": [
              "type",
              "value",
            ],
            "type": "object",
          },
          "TreeNode": {
            "$id": "https://ast.dev/TreeNode",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "oneOf": [
              {
                "$ref": "https://ast.dev/LeafNode",
              },
              {
                "$ref": "https://ast.dev/BranchNode",
              },
            ],
          },
        },
      }
    `);
  });

  test("registry without URI function uses local refs", () => {
    const myRegistry = z.registry<{ id: string }>();

    const Parent = z.object({
      name: z.string(),
      get children() {
        return z.array(Child);
      },
    });

    const Child = z.object({
      name: z.string(),
      get parent() {
        return Parent;
      },
    });

    myRegistry.add(Parent, { id: "Parent" });
    myRegistry.add(Child, { id: "Child" });

    // No uri function - should use simple local refs
    const result = z.toJSONSchema(myRegistry);

    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Child": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "name": {
                "$ref": "__shared#/$defs/schema0",
              },
              "parent": {
                "$ref": "Parent",
              },
            },
            "required": [
              "name",
              "parent",
            ],
            "type": "object",
          },
          "Parent": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "children": {
                "items": {
                  "$ref": "Child",
                },
                "type": "array",
              },
              "name": {
                "$ref": "__shared#/$defs/schema0",
              },
            },
            "required": [
              "name",
              "children",
            ],
            "type": "object",
          },
          "__shared": {
            "$defs": {
              "schema0": {
                "type": "string",
              },
            },
          },
        },
      }
    `);
  });

  test("complex registry: graph structure with multiple node types", () => {
    const myRegistry = z.registry<{ id: string }>();

    const Edge = z.object({
      weight: z.number(),
      get source() {
        return GraphNode;
      },
      get target() {
        return GraphNode;
      },
    });

    const GraphNode = z.object({
      id: z.string(),
      label: z.string(),
      get outgoingEdges() {
        return z.array(Edge);
      },
      get incomingEdges() {
        return z.array(Edge);
      },
    });

    const Graph = z.object({
      name: z.string(),
      get nodes() {
        return z.array(GraphNode);
      },
      get edges() {
        return z.array(Edge);
      },
    });

    myRegistry.add(Edge, { id: "Edge" });
    myRegistry.add(GraphNode, { id: "GraphNode" });
    myRegistry.add(Graph, { id: "Graph" });

    const result = z.toJSONSchema(myRegistry, {
      uri: (id) => `https://graph.api/${id}.schema.json`,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Edge": {
            "$id": "https://graph.api/Edge.schema.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "source": {
                "$ref": "https://graph.api/GraphNode.schema.json",
              },
              "target": {
                "$ref": "https://graph.api/GraphNode.schema.json",
              },
              "weight": {
                "type": "number",
              },
            },
            "required": [
              "weight",
              "source",
              "target",
            ],
            "type": "object",
          },
          "Graph": {
            "$id": "https://graph.api/Graph.schema.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "edges": {
                "items": {
                  "$ref": "https://graph.api/Edge.schema.json",
                },
                "type": "array",
              },
              "name": {
                "$ref": "https://graph.api/__shared.schema.json#/$defs/schema0",
              },
              "nodes": {
                "items": {
                  "$ref": "https://graph.api/GraphNode.schema.json",
                },
                "type": "array",
              },
            },
            "required": [
              "name",
              "nodes",
              "edges",
            ],
            "type": "object",
          },
          "GraphNode": {
            "$id": "https://graph.api/GraphNode.schema.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "id": {
                "$ref": "https://graph.api/__shared.schema.json#/$defs/schema0",
              },
              "incomingEdges": {
                "items": {
                  "$ref": "https://graph.api/Edge.schema.json",
                },
                "type": "array",
              },
              "label": {
                "$ref": "https://graph.api/__shared.schema.json#/$defs/schema0",
              },
              "outgoingEdges": {
                "items": {
                  "$ref": "https://graph.api/Edge.schema.json",
                },
                "type": "array",
              },
            },
            "required": [
              "id",
              "label",
              "outgoingEdges",
              "incomingEdges",
            ],
            "type": "object",
          },
          "__shared": {
            "$defs": {
              "schema0": {
                "type": "string",
              },
            },
          },
        },
      }
    `);
  });

  test("EXTREME: deeply nested enterprise data model with complex cycles", () => {
    const myRegistry = z.registry<{ id: string }>();

    // ========================================================================
    // ORGANIZATION LAYER
    // ========================================================================

    const Address = z.object({
      street: z.string(),
      city: z.string(),
      country: z.string(),
      postalCode: z.string(),
    });

    const ContactInfo = z.object({
      email: z.string().email(),
      phone: z.string().optional(),
      address: Address,
    });

    const Organization = z.object({
      id: z.string().uuid(),
      name: z.string(),
      type: z.enum(["corporation", "nonprofit", "government", "startup"]),
      contact: ContactInfo,
      get parentOrganization() {
        return Organization.optional();
      },
      get subsidiaries() {
        return z.array(Organization);
      },
      get departments() {
        return z.array(Department);
      },
      get employees() {
        return z.array(Employee);
      },
    });

    const Department = z.object({
      id: z.string().uuid(),
      name: z.string(),
      budget: z.number(),
      get organization() {
        return Organization;
      },
      get parentDepartment() {
        return Department.optional();
      },
      get subDepartments() {
        return z.array(Department);
      },
      get manager() {
        return Employee.optional();
      },
      get employees() {
        return z.array(Employee);
      },
      get projects() {
        return z.array(Project);
      },
    });

    // ========================================================================
    // EMPLOYEE LAYER
    // ========================================================================

    const Skill = z.object({
      name: z.string(),
      level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      get certifications() {
        return z.array(Certification);
      },
    });

    const Certification = z.object({
      name: z.string(),
      issuedBy: z.string(),
      issuedDate: z.string(),
      expiryDate: z.string().optional(),
      get skill() {
        return Skill;
      },
      get employee() {
        return Employee;
      },
    });

    const Employee = z.object({
      id: z.string().uuid(),
      firstName: z.string(),
      lastName: z.string(),
      title: z.string(),
      contact: ContactInfo,
      hireDate: z.string(),
      salary: z.number(),
      get organization() {
        return Organization;
      },
      get department() {
        return Department;
      },
      get manager() {
        return Employee.optional();
      },
      get directReports() {
        return z.array(Employee);
      },
      get skills() {
        return z.array(Skill);
      },
      get certifications() {
        return z.array(Certification);
      },
      get projectAssignments() {
        return z.array(ProjectAssignment);
      },
      get performanceReviews() {
        return z.array(PerformanceReview);
      },
      get createdTasks() {
        return z.array(Task);
      },
      get assignedTasks() {
        return z.array(Task);
      },
    });

    const PerformanceReview = z.object({
      id: z.string().uuid(),
      reviewDate: z.string(),
      rating: z.number().min(1).max(5),
      comments: z.string(),
      get employee() {
        return Employee;
      },
      get reviewer() {
        return Employee;
      },
      get goals() {
        return z.array(Goal);
      },
    });

    const Goal = z.object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string(),
      targetDate: z.string(),
      status: z.enum(["not_started", "in_progress", "completed", "cancelled"]),
      get employee() {
        return Employee;
      },
      get review() {
        return PerformanceReview.optional();
      },
      get relatedTasks() {
        return z.array(Task);
      },
    });

    // ========================================================================
    // PROJECT LAYER
    // ========================================================================

    const Project = z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
      budget: z.number(),
      get department() {
        return Department;
      },
      get parentProject() {
        return Project.optional();
      },
      get subProjects() {
        return z.array(Project);
      },
      get projectLead() {
        return Employee;
      },
      get assignments() {
        return z.array(ProjectAssignment);
      },
      get milestones() {
        return z.array(Milestone);
      },
      get tasks() {
        return z.array(Task);
      },
      get relatedProjects() {
        return z.array(Project);
      },
    });

    const ProjectAssignment = z.object({
      id: z.string().uuid(),
      role: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      allocationPercentage: z.number().min(0).max(100),
      get project() {
        return Project;
      },
      get employee() {
        return Employee;
      },
    });

    const Milestone = z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      dueDate: z.string(),
      completedDate: z.string().optional(),
      status: z.enum(["pending", "in_progress", "completed", "missed"]),
      get project() {
        return Project;
      },
      get tasks() {
        return z.array(Task);
      },
      get dependencies() {
        return z.array(Milestone);
      },
      get dependents() {
        return z.array(Milestone);
      },
    });

    // ========================================================================
    // TASK LAYER
    // ========================================================================

    const TaskComment = z.object({
      id: z.string().uuid(),
      content: z.string(),
      createdAt: z.string(),
      updatedAt: z.string().optional(),
      get author() {
        return Employee;
      },
      get task() {
        return Task;
      },
      get parentComment() {
        return TaskComment.optional();
      },
      get replies() {
        return z.array(TaskComment);
      },
    });

    const TaskAttachment = z.object({
      id: z.string().uuid(),
      filename: z.string(),
      mimeType: z.string(),
      size: z.number(),
      uploadedAt: z.string(),
      get uploadedBy() {
        return Employee;
      },
      get task() {
        return Task;
      },
    });

    const Task = z.object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string(),
      priority: z.enum(["low", "medium", "high", "critical"]),
      status: z.enum(["backlog", "todo", "in_progress", "review", "done", "cancelled"]),
      estimatedHours: z.number().optional(),
      actualHours: z.number().optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
      dueDate: z.string().optional(),
      get project() {
        return Project;
      },
      get milestone() {
        return Milestone.optional();
      },
      get createdBy() {
        return Employee;
      },
      get assignee() {
        return Employee.optional();
      },
      get parentTask() {
        return Task.optional();
      },
      get subtasks() {
        return z.array(Task);
      },
      get blockedBy() {
        return z.array(Task);
      },
      get blocks() {
        return z.array(Task);
      },
      get relatedTasks() {
        return z.array(Task);
      },
      get comments() {
        return z.array(TaskComment);
      },
      get attachments() {
        return z.array(TaskAttachment);
      },
      get relatedGoals() {
        return z.array(Goal);
      },
    });

    // ========================================================================
    // REGISTER ALL SCHEMAS
    // ========================================================================

    myRegistry.add(Address, { id: "Address" });
    myRegistry.add(ContactInfo, { id: "ContactInfo" });
    myRegistry.add(Organization, { id: "Organization" });
    myRegistry.add(Department, { id: "Department" });
    myRegistry.add(Skill, { id: "Skill" });
    myRegistry.add(Certification, { id: "Certification" });
    myRegistry.add(Employee, { id: "Employee" });
    myRegistry.add(PerformanceReview, { id: "PerformanceReview" });
    myRegistry.add(Goal, { id: "Goal" });
    myRegistry.add(Project, { id: "Project" });
    myRegistry.add(ProjectAssignment, { id: "ProjectAssignment" });
    myRegistry.add(Milestone, { id: "Milestone" });
    myRegistry.add(TaskComment, { id: "TaskComment" });
    myRegistry.add(TaskAttachment, { id: "TaskAttachment" });
    myRegistry.add(Task, { id: "Task" });

    const result = z.toJSONSchema(myRegistry, {
      uri: (id) => `https://enterprise.api/schemas/v1/${id}.json`,
      dedupeContent: false, // Disable content dedup for this test to keep it focused on cycles
    });

    // Verify all schemas are generated (15 registered schemas)
    expect(Object.keys(result.schemas)).toHaveLength(15);

    // Cast to any for property access assertions
    const schemas = result.schemas as any;

    // Verify key circular references are resolved correctly
    // Organization self-reference
    expect(schemas.Organization.properties.parentOrganization.$ref).toBe(
      "https://enterprise.api/schemas/v1/Organization.json"
    );
    expect(schemas.Organization.properties.subsidiaries.items.$ref).toBe(
      "https://enterprise.api/schemas/v1/Organization.json"
    );

    // Department cycles
    expect(schemas.Department.properties.parentDepartment.$ref).toBe(
      "https://enterprise.api/schemas/v1/Department.json"
    );
    expect(schemas.Department.properties.subDepartments.items.$ref).toBe(
      "https://enterprise.api/schemas/v1/Department.json"
    );
    expect(schemas.Department.properties.organization.$ref).toBe("https://enterprise.api/schemas/v1/Organization.json");

    // Employee cycles - manager/directReports
    expect(schemas.Employee.properties.manager.$ref).toBe("https://enterprise.api/schemas/v1/Employee.json");
    expect(schemas.Employee.properties.directReports.items.$ref).toBe(
      "https://enterprise.api/schemas/v1/Employee.json"
    );

    // Project cycles - parent/sub/related
    expect(schemas.Project.properties.parentProject.$ref).toBe("https://enterprise.api/schemas/v1/Project.json");
    expect(schemas.Project.properties.subProjects.items.$ref).toBe("https://enterprise.api/schemas/v1/Project.json");
    expect(schemas.Project.properties.relatedProjects.items.$ref).toBe(
      "https://enterprise.api/schemas/v1/Project.json"
    );

    // Task cycles - parent/subtasks/blocked/blocks/related
    expect(schemas.Task.properties.parentTask.$ref).toBe("https://enterprise.api/schemas/v1/Task.json");
    expect(schemas.Task.properties.subtasks.items.$ref).toBe("https://enterprise.api/schemas/v1/Task.json");
    expect(schemas.Task.properties.blockedBy.items.$ref).toBe("https://enterprise.api/schemas/v1/Task.json");
    expect(schemas.Task.properties.blocks.items.$ref).toBe("https://enterprise.api/schemas/v1/Task.json");
    expect(schemas.Task.properties.relatedTasks.items.$ref).toBe("https://enterprise.api/schemas/v1/Task.json");

    // Milestone dependencies cycle
    expect(schemas.Milestone.properties.dependencies.items.$ref).toBe(
      "https://enterprise.api/schemas/v1/Milestone.json"
    );
    expect(schemas.Milestone.properties.dependents.items.$ref).toBe("https://enterprise.api/schemas/v1/Milestone.json");

    // TaskComment self-reference (threaded comments)
    expect(schemas.TaskComment.properties.parentComment.$ref).toBe(
      "https://enterprise.api/schemas/v1/TaskComment.json"
    );
    expect(schemas.TaskComment.properties.replies.items.$ref).toBe(
      "https://enterprise.api/schemas/v1/TaskComment.json"
    );

    // Cross-entity references
    expect(schemas.Employee.properties.organization.$ref).toBe("https://enterprise.api/schemas/v1/Organization.json");
    expect(schemas.Employee.properties.department.$ref).toBe("https://enterprise.api/schemas/v1/Department.json");
    expect(schemas.Task.properties.project.$ref).toBe("https://enterprise.api/schemas/v1/Project.json");
    expect(schemas.Task.properties.milestone.$ref).toBe("https://enterprise.api/schemas/v1/Milestone.json");

    // Skill <-> Certification bidirectional
    expect(schemas.Skill.properties.certifications.items.$ref).toBe(
      "https://enterprise.api/schemas/v1/Certification.json"
    );
    expect(schemas.Certification.properties.skill.$ref).toBe("https://enterprise.api/schemas/v1/Skill.json");

    // PerformanceReview -> Employee (both employee and reviewer)
    expect(schemas.PerformanceReview.properties.employee.$ref).toBe("https://enterprise.api/schemas/v1/Employee.json");
    expect(schemas.PerformanceReview.properties.reviewer.$ref).toBe("https://enterprise.api/schemas/v1/Employee.json");

    // Goal <-> Task bidirectional
    expect(schemas.Goal.properties.relatedTasks.items.$ref).toBe("https://enterprise.api/schemas/v1/Task.json");
    expect(schemas.Task.properties.relatedGoals.items.$ref).toBe("https://enterprise.api/schemas/v1/Goal.json");

    // Full snapshot for complete verification
    expect(result).toMatchInlineSnapshot(`
      {
        "schemas": {
          "Address": {
            "$id": "https://enterprise.api/schemas/v1/Address.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "city": {
                "type": "string",
              },
              "country": {
                "type": "string",
              },
              "postalCode": {
                "type": "string",
              },
              "street": {
                "type": "string",
              },
            },
            "required": [
              "street",
              "city",
              "country",
              "postalCode",
            ],
            "type": "object",
          },
          "Certification": {
            "$id": "https://enterprise.api/schemas/v1/Certification.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "employee": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "expiryDate": {
                "type": "string",
              },
              "issuedBy": {
                "type": "string",
              },
              "issuedDate": {
                "type": "string",
              },
              "name": {
                "type": "string",
              },
              "skill": {
                "$ref": "https://enterprise.api/schemas/v1/Skill.json",
              },
            },
            "required": [
              "name",
              "issuedBy",
              "issuedDate",
              "skill",
              "employee",
            ],
            "type": "object",
          },
          "ContactInfo": {
            "$id": "https://enterprise.api/schemas/v1/ContactInfo.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "address": {
                "$ref": "https://enterprise.api/schemas/v1/Address.json",
              },
              "email": {
                "format": "email",
                "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
                "type": "string",
              },
              "phone": {
                "type": "string",
              },
            },
            "required": [
              "email",
              "address",
            ],
            "type": "object",
          },
          "Department": {
            "$id": "https://enterprise.api/schemas/v1/Department.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "budget": {
                "type": "number",
              },
              "employees": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Employee.json",
                },
                "type": "array",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "manager": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "name": {
                "type": "string",
              },
              "organization": {
                "$ref": "https://enterprise.api/schemas/v1/Organization.json",
              },
              "parentDepartment": {
                "$ref": "https://enterprise.api/schemas/v1/Department.json",
              },
              "projects": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Project.json",
                },
                "type": "array",
              },
              "subDepartments": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Department.json",
                },
                "type": "array",
              },
            },
            "required": [
              "id",
              "name",
              "budget",
              "organization",
              "subDepartments",
              "employees",
              "projects",
            ],
            "type": "object",
          },
          "Employee": {
            "$id": "https://enterprise.api/schemas/v1/Employee.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "assignedTasks": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Task.json",
                },
                "type": "array",
              },
              "certifications": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Certification.json",
                },
                "type": "array",
              },
              "contact": {
                "$ref": "https://enterprise.api/schemas/v1/ContactInfo.json",
              },
              "createdTasks": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Task.json",
                },
                "type": "array",
              },
              "department": {
                "$ref": "https://enterprise.api/schemas/v1/Department.json",
              },
              "directReports": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Employee.json",
                },
                "type": "array",
              },
              "firstName": {
                "type": "string",
              },
              "hireDate": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "lastName": {
                "type": "string",
              },
              "manager": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "organization": {
                "$ref": "https://enterprise.api/schemas/v1/Organization.json",
              },
              "performanceReviews": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/PerformanceReview.json",
                },
                "type": "array",
              },
              "projectAssignments": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/ProjectAssignment.json",
                },
                "type": "array",
              },
              "salary": {
                "type": "number",
              },
              "skills": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Skill.json",
                },
                "type": "array",
              },
              "title": {
                "type": "string",
              },
            },
            "required": [
              "id",
              "firstName",
              "lastName",
              "title",
              "contact",
              "hireDate",
              "salary",
              "organization",
              "department",
              "directReports",
              "skills",
              "certifications",
              "projectAssignments",
              "performanceReviews",
              "createdTasks",
              "assignedTasks",
            ],
            "type": "object",
          },
          "Goal": {
            "$id": "https://enterprise.api/schemas/v1/Goal.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "description": {
                "type": "string",
              },
              "employee": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "relatedTasks": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Task.json",
                },
                "type": "array",
              },
              "review": {
                "$ref": "https://enterprise.api/schemas/v1/PerformanceReview.json",
              },
              "status": {
                "enum": [
                  "not_started",
                  "in_progress",
                  "completed",
                  "cancelled",
                ],
                "type": "string",
              },
              "targetDate": {
                "type": "string",
              },
              "title": {
                "type": "string",
              },
            },
            "required": [
              "id",
              "title",
              "description",
              "targetDate",
              "status",
              "employee",
              "relatedTasks",
            ],
            "type": "object",
          },
          "Milestone": {
            "$id": "https://enterprise.api/schemas/v1/Milestone.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "completedDate": {
                "type": "string",
              },
              "dependencies": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Milestone.json",
                },
                "type": "array",
              },
              "dependents": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Milestone.json",
                },
                "type": "array",
              },
              "description": {
                "type": "string",
              },
              "dueDate": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "name": {
                "type": "string",
              },
              "project": {
                "$ref": "https://enterprise.api/schemas/v1/Project.json",
              },
              "status": {
                "enum": [
                  "pending",
                  "in_progress",
                  "completed",
                  "missed",
                ],
                "type": "string",
              },
              "tasks": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Task.json",
                },
                "type": "array",
              },
            },
            "required": [
              "id",
              "name",
              "description",
              "dueDate",
              "status",
              "project",
              "tasks",
              "dependencies",
              "dependents",
            ],
            "type": "object",
          },
          "Organization": {
            "$id": "https://enterprise.api/schemas/v1/Organization.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "contact": {
                "$ref": "https://enterprise.api/schemas/v1/ContactInfo.json",
              },
              "departments": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Department.json",
                },
                "type": "array",
              },
              "employees": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Employee.json",
                },
                "type": "array",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "name": {
                "type": "string",
              },
              "parentOrganization": {
                "$ref": "https://enterprise.api/schemas/v1/Organization.json",
              },
              "subsidiaries": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Organization.json",
                },
                "type": "array",
              },
              "type": {
                "enum": [
                  "corporation",
                  "nonprofit",
                  "government",
                  "startup",
                ],
                "type": "string",
              },
            },
            "required": [
              "id",
              "name",
              "type",
              "contact",
              "subsidiaries",
              "departments",
              "employees",
            ],
            "type": "object",
          },
          "PerformanceReview": {
            "$id": "https://enterprise.api/schemas/v1/PerformanceReview.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "comments": {
                "type": "string",
              },
              "employee": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "goals": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Goal.json",
                },
                "type": "array",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "rating": {
                "maximum": 5,
                "minimum": 1,
                "type": "number",
              },
              "reviewDate": {
                "type": "string",
              },
              "reviewer": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
            },
            "required": [
              "id",
              "reviewDate",
              "rating",
              "comments",
              "employee",
              "reviewer",
              "goals",
            ],
            "type": "object",
          },
          "Project": {
            "$id": "https://enterprise.api/schemas/v1/Project.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "assignments": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/ProjectAssignment.json",
                },
                "type": "array",
              },
              "budget": {
                "type": "number",
              },
              "department": {
                "$ref": "https://enterprise.api/schemas/v1/Department.json",
              },
              "description": {
                "type": "string",
              },
              "endDate": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "milestones": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Milestone.json",
                },
                "type": "array",
              },
              "name": {
                "type": "string",
              },
              "parentProject": {
                "$ref": "https://enterprise.api/schemas/v1/Project.json",
              },
              "projectLead": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "relatedProjects": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Project.json",
                },
                "type": "array",
              },
              "startDate": {
                "type": "string",
              },
              "status": {
                "enum": [
                  "planning",
                  "active",
                  "on_hold",
                  "completed",
                  "cancelled",
                ],
                "type": "string",
              },
              "subProjects": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Project.json",
                },
                "type": "array",
              },
              "tasks": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Task.json",
                },
                "type": "array",
              },
            },
            "required": [
              "id",
              "name",
              "description",
              "startDate",
              "status",
              "budget",
              "department",
              "subProjects",
              "projectLead",
              "assignments",
              "milestones",
              "tasks",
              "relatedProjects",
            ],
            "type": "object",
          },
          "ProjectAssignment": {
            "$id": "https://enterprise.api/schemas/v1/ProjectAssignment.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "allocationPercentage": {
                "maximum": 100,
                "minimum": 0,
                "type": "number",
              },
              "employee": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "endDate": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "project": {
                "$ref": "https://enterprise.api/schemas/v1/Project.json",
              },
              "role": {
                "type": "string",
              },
              "startDate": {
                "type": "string",
              },
            },
            "required": [
              "id",
              "role",
              "startDate",
              "allocationPercentage",
              "project",
              "employee",
            ],
            "type": "object",
          },
          "Skill": {
            "$id": "https://enterprise.api/schemas/v1/Skill.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "certifications": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Certification.json",
                },
                "type": "array",
              },
              "level": {
                "enum": [
                  "beginner",
                  "intermediate",
                  "advanced",
                  "expert",
                ],
                "type": "string",
              },
              "name": {
                "type": "string",
              },
            },
            "required": [
              "name",
              "level",
              "certifications",
            ],
            "type": "object",
          },
          "Task": {
            "$id": "https://enterprise.api/schemas/v1/Task.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "actualHours": {
                "type": "number",
              },
              "assignee": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "attachments": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/TaskAttachment.json",
                },
                "type": "array",
              },
              "blockedBy": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Task.json",
                },
                "type": "array",
              },
              "blocks": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Task.json",
                },
                "type": "array",
              },
              "comments": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/TaskComment.json",
                },
                "type": "array",
              },
              "createdAt": {
                "type": "string",
              },
              "createdBy": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "description": {
                "type": "string",
              },
              "dueDate": {
                "type": "string",
              },
              "estimatedHours": {
                "type": "number",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "milestone": {
                "$ref": "https://enterprise.api/schemas/v1/Milestone.json",
              },
              "parentTask": {
                "$ref": "https://enterprise.api/schemas/v1/Task.json",
              },
              "priority": {
                "enum": [
                  "low",
                  "medium",
                  "high",
                  "critical",
                ],
                "type": "string",
              },
              "project": {
                "$ref": "https://enterprise.api/schemas/v1/Project.json",
              },
              "relatedGoals": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Goal.json",
                },
                "type": "array",
              },
              "relatedTasks": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Task.json",
                },
                "type": "array",
              },
              "status": {
                "enum": [
                  "backlog",
                  "todo",
                  "in_progress",
                  "review",
                  "done",
                  "cancelled",
                ],
                "type": "string",
              },
              "subtasks": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/Task.json",
                },
                "type": "array",
              },
              "title": {
                "type": "string",
              },
              "updatedAt": {
                "type": "string",
              },
            },
            "required": [
              "id",
              "title",
              "description",
              "priority",
              "status",
              "createdAt",
              "updatedAt",
              "project",
              "createdBy",
              "subtasks",
              "blockedBy",
              "blocks",
              "relatedTasks",
              "comments",
              "attachments",
              "relatedGoals",
            ],
            "type": "object",
          },
          "TaskAttachment": {
            "$id": "https://enterprise.api/schemas/v1/TaskAttachment.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "filename": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "mimeType": {
                "type": "string",
              },
              "size": {
                "type": "number",
              },
              "task": {
                "$ref": "https://enterprise.api/schemas/v1/Task.json",
              },
              "uploadedAt": {
                "type": "string",
              },
              "uploadedBy": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
            },
            "required": [
              "id",
              "filename",
              "mimeType",
              "size",
              "uploadedAt",
              "uploadedBy",
              "task",
            ],
            "type": "object",
          },
          "TaskComment": {
            "$id": "https://enterprise.api/schemas/v1/TaskComment.json",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
              "author": {
                "$ref": "https://enterprise.api/schemas/v1/Employee.json",
              },
              "content": {
                "type": "string",
              },
              "createdAt": {
                "type": "string",
              },
              "id": {
                "format": "uuid",
                "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                "type": "string",
              },
              "parentComment": {
                "$ref": "https://enterprise.api/schemas/v1/TaskComment.json",
              },
              "replies": {
                "items": {
                  "$ref": "https://enterprise.api/schemas/v1/TaskComment.json",
                },
                "type": "array",
              },
              "task": {
                "$ref": "https://enterprise.api/schemas/v1/Task.json",
              },
              "updatedAt": {
                "type": "string",
              },
            },
            "required": [
              "id",
              "content",
              "createdAt",
              "author",
              "task",
              "replies",
            ],
            "type": "object",
          },
        },
      }
    `);
  });
});

describe("shared primitives optimization", () => {
  test("reusing schema instances with reused:'ref' deduplicates identical schemas", () => {
    // Define shared primitives ONCE - reuse everywhere
    const UUID = z.string().uuid();
    const Email = z.string().email();
    const DateString = z.string().datetime();

    // Multiple schemas all using the same UUID/Email/Date instances
    const User = z.object({
      id: UUID,
      email: Email,
      createdAt: DateString,
      updatedAt: DateString,
    });

    const Organization = z.object({
      id: UUID,
      contactEmail: Email,
      createdAt: DateString,
    });

    const Project = z.object({
      id: UUID,
      ownerId: UUID, // Same UUID instance used multiple times
      createdAt: DateString,
      modifiedAt: DateString,
    });

    // Combine into a single schema to demonstrate deduplication
    const ApiResponse = z.object({
      user: User,
      organization: Organization,
      project: Project,
    });

    // WITH dedupeContent:false - schemas are inlined (opt-out of default deduplication)
    const inlinedResult = z.toJSONSchema(ApiResponse, { dedupeContent: false });
    expect(inlinedResult.$defs).toBeUndefined(); // No $defs when deduplication is disabled

    // WITH reused:"ref" - identical schemas extracted to $defs
    const deduplicatedResult = z.toJSONSchema(ApiResponse, { reused: "ref" });

    // UUID should appear only ONCE in $defs, rest are $refs
    expect(deduplicatedResult.$defs).toBeDefined();
    const defs = deduplicatedResult.$defs as Record<string, any>;

    // Find the UUID definition
    const uuidDef = Object.values(defs).find((def: any) => def.format === "uuid");
    expect(uuidDef).toBeDefined();

    // Find the email definition
    const emailDef = Object.values(defs).find((def: any) => def.format === "email");
    expect(emailDef).toBeDefined();

    // Find the datetime definition
    const datetimeDef = Object.values(defs).find((def: any) => def.format === "date-time");
    expect(datetimeDef).toBeDefined();

    // Verify the structure - $refs should replace inlined schemas
    expect(deduplicatedResult).toMatchInlineSnapshot(`
      {
        "$defs": {
          "__schema0": {
            "format": "uuid",
            "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
            "type": "string",
          },
          "__schema1": {
            "format": "email",
            "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
            "type": "string",
          },
          "__schema2": {
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$",
            "type": "string",
          },
        },
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "organization": {
            "additionalProperties": false,
            "properties": {
              "contactEmail": {
                "$ref": "#/$defs/__schema1",
              },
              "createdAt": {
                "$ref": "#/$defs/__schema2",
              },
              "id": {
                "$ref": "#/$defs/__schema0",
              },
            },
            "required": [
              "id",
              "contactEmail",
              "createdAt",
            ],
            "type": "object",
          },
          "project": {
            "additionalProperties": false,
            "properties": {
              "createdAt": {
                "$ref": "#/$defs/__schema2",
              },
              "id": {
                "$ref": "#/$defs/__schema0",
              },
              "modifiedAt": {
                "$ref": "#/$defs/__schema2",
              },
              "ownerId": {
                "$ref": "#/$defs/__schema0",
              },
            },
            "required": [
              "id",
              "ownerId",
              "createdAt",
              "modifiedAt",
            ],
            "type": "object",
          },
          "user": {
            "additionalProperties": false,
            "properties": {
              "createdAt": {
                "$ref": "#/$defs/__schema2",
              },
              "email": {
                "$ref": "#/$defs/__schema1",
              },
              "id": {
                "$ref": "#/$defs/__schema0",
              },
              "updatedAt": {
                "$ref": "#/$defs/__schema2",
              },
            },
            "required": [
              "id",
              "email",
              "createdAt",
              "updatedAt",
            ],
            "type": "object",
          },
        },
        "required": [
          "user",
          "organization",
          "project",
        ],
        "type": "object",
      }
    `);
  });

  test("registry with shared primitives produces optimal external refs", () => {
    const myRegistry = z.registry<{ id: string }>();

    // Shared primitives registered with IDs
    const UUID = z.string().uuid();
    const Email = z.string().email();

    myRegistry.add(UUID, { id: "UUID" });
    myRegistry.add(Email, { id: "Email" });

    // Entity schemas that reuse the primitives
    const User = z.object({
      id: UUID,
      email: Email,
      managerId: UUID.optional(),
    });

    const Team = z.object({
      id: UUID,
      leadId: UUID,
      contactEmail: Email,
    });

    myRegistry.add(User, { id: "User" });
    myRegistry.add(Team, { id: "Team" });

    const result = z.toJSONSchema(myRegistry, {
      uri: (id) => `https://api.example.com/schemas/${id}.json`,
    });

    // UUID and Email should be their own schemas with $refs
    expect(result.schemas.UUID).toMatchInlineSnapshot(`
      {
        "$id": "https://api.example.com/schemas/UUID.json",
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "uuid",
        "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
        "type": "string",
      }
    `);

    expect(result.schemas.Email).toMatchInlineSnapshot(`
      {
        "$id": "https://api.example.com/schemas/Email.json",
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "format": "email",
        "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
        "type": "string",
      }
    `);

    // User and Team should reference UUID and Email via external $refs
    expect(result.schemas.User).toMatchInlineSnapshot(`
      {
        "$id": "https://api.example.com/schemas/User.json",
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "email": {
            "$ref": "https://api.example.com/schemas/Email.json",
          },
          "id": {
            "$ref": "https://api.example.com/schemas/UUID.json",
          },
          "managerId": {
            "$ref": "https://api.example.com/schemas/UUID.json",
          },
        },
        "required": [
          "id",
          "email",
        ],
        "type": "object",
      }
    `);

    expect(result.schemas.Team).toMatchInlineSnapshot(`
      {
        "$id": "https://api.example.com/schemas/Team.json",
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "additionalProperties": false,
        "properties": {
          "contactEmail": {
            "$ref": "https://api.example.com/schemas/Email.json",
          },
          "id": {
            "$ref": "https://api.example.com/schemas/UUID.json",
          },
          "leadId": {
            "$ref": "https://api.example.com/schemas/UUID.json",
          },
        },
        "required": [
          "id",
          "leadId",
          "contactEmail",
        ],
        "type": "object",
      }
    `);
  });

  test("content-based deduplication works automatically for separate instances", () => {
    // Even with SEPARATE instances, content-based deduplication kicks in
    const Schema = z.object({
      id1: z.string().uuid(),
      id2: z.string().uuid(),
      id3: z.string().uuid(),
      email1: z.string().email(),
      email2: z.string().email(),
    });

    // Default behavior: content-based deduplication is ON
    const deduplicatedResult = z.toJSONSchema(Schema);

    // $defs are created for deduplicated content
    expect(deduplicatedResult.$defs).toBeDefined();
    expect(Object.keys(deduplicatedResult.$defs as object).length).toBe(2); // UUID and Email

    // Opt-out: disable content-based deduplication
    const inlinedResult = z.toJSONSchema(Schema, { dedupeContent: false });

    // No $defs when deduplication is disabled
    expect(inlinedResult.$defs).toBeUndefined();

    // Size comparison: deduplicated should be smaller
    const deduplicatedSize = JSON.stringify(deduplicatedResult).length;
    const inlinedSize = JSON.stringify(inlinedResult).length;

    expect(deduplicatedSize).toBeLessThan(inlinedSize);

    // Savings should be significant (>30%)
    const savingsPercent = ((inlinedSize - deduplicatedSize) / inlinedSize) * 100;
    expect(savingsPercent).toBeGreaterThan(30);
  });
});
