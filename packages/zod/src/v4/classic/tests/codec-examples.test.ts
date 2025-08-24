import { expect, test } from "vitest";
import * as z from "zod/v4";

// ============================================================================
// Number/BigInt Codecs
// ============================================================================

const stringToNumber = () =>
  z.codec(z.string(), z.number(), {
    decode: (str) => Number.parseFloat(str),
    encode: (num) => num.toString(),
  });

const stringToInt = () =>
  z.codec(z.string(), z.int(), {
    decode: (str) => Number.parseInt(str, 10),
    encode: (num) => num.toString(),
  });

const stringToBigInt = () =>
  z.codec(z.string(), z.bigint(), {
    decode: (str) => BigInt(str),
    encode: (bigint) => bigint.toString(),
  });

const numberToBigInt = () =>
  z.codec(z.int(), z.bigint(), {
    decode: (num) => BigInt(num),
    encode: (bigint) => Number(bigint),
  });

// ============================================================================
// Date/Duration Codecs
// ============================================================================

const isoDatetimeToDate = () =>
  z.codec(z.iso.datetime(), z.date(), {
    decode: (isoString) => new Date(isoString),
    encode: (date) => date.toISOString(),
  });

const epochSecondsToDate = () =>
  z.codec(z.int().min(0), z.date(), {
    decode: (seconds) => new Date(seconds * 1000),
    encode: (date) => Math.floor(date.getTime() / 1000),
  });

const epochMillisToDate = () =>
  z.codec(z.int().min(0), z.date(), {
    decode: (millis) => new Date(millis),
    encode: (date) => date.getTime(),
  });

// ============================================================================
// JSON Codec
// ============================================================================

const json = <T extends z.ZodTypeAny>(schema: T) =>
  z.codec(z.string(), schema, {
    decode: (jsonString) => JSON.parse(jsonString),
    encode: (value) => JSON.stringify(value),
  });

// ============================================================================
// Text/Bytes Codecs
// ============================================================================

const utf8ToBytes = () =>
  z.codec(z.string(), z.instanceof(Uint8Array), {
    decode: (str) => new TextEncoder().encode(str),
    encode: (bytes) => new TextDecoder().decode(bytes),
  });

const bytesToUtf8 = () =>
  z.codec(z.instanceof(Uint8Array), z.string(), {
    decode: (bytes) => new TextDecoder().decode(bytes),
    encode: (str) => new TextEncoder().encode(str),
  });

// ============================================================================
// Binary-to-text Codecs
// ============================================================================

// Using utility functions from z.core.util

const base64 = () =>
  z.codec(z.base64(), z.instanceof(Uint8Array), {
    decode: (base64String) => z.core.util.base64ToUint8Array(base64String),
    encode: (bytes) => z.core.util.uint8ArrayToBase64(bytes),
  });

const base64urlToBytes = () =>
  z.codec(z.base64url(), z.instanceof(Uint8Array), {
    decode: (base64urlString) => z.core.util.base64urlToUint8Array(base64urlString),
    encode: (bytes) => z.core.util.uint8ArrayToBase64url(bytes),
  });

const hexToBytes = () =>
  z.codec(z.hex(), z.instanceof(Uint8Array), {
    decode: (hexString) => z.core.util.hexToUint8Array(hexString),
    encode: (bytes) => z.core.util.uint8ArrayToHex(bytes),
  });

// ============================================================================
// URL Codecs
// ============================================================================

const stringToURL = () =>
  z.codec(z.url(), z.instanceof(URL), {
    decode: (urlString) => new URL(urlString),
    encode: (url) => url.href,
  });

const stringToHttpURL = () =>
  z.codec(z.httpUrl(), z.instanceof(URL), {
    decode: (urlString) => new URL(urlString),
    encode: (url) => url.href,
  });

const uriComponent = () =>
  z.codec(z.string(), z.string(), {
    decode: (encodedString) => decodeURIComponent(encodedString),
    encode: (decodedString) => encodeURIComponent(decodedString),
  });

// ============================================================================
// Boolean Codec
// ============================================================================

const stringToBoolean = (options?: { truthy?: string[]; falsy?: string[] }) => z.stringbool(options);

// ============================================================================
// Tests
// ============================================================================

test("stringToNumber codec", () => {
  const codec = stringToNumber();

  // Test decode
  expect(z.decode(codec, "42.5")).toBe(42.5);
  expect(z.decode(codec, "0")).toBe(0);
  expect(z.decode(codec, "-123.456")).toBe(-123.456);

  // Test encode
  expect(z.encode(codec, 42.5)).toBe("42.5");
  expect(z.encode(codec, 0)).toBe("0");
  expect(z.encode(codec, -123.456)).toBe("-123.456");

  // Test round trip
  const original = "3.14159";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe("3.14159");
});

test("stringToInt codec", () => {
  const codec = stringToInt();

  // Test decode
  expect(z.decode(codec, "42")).toBe(42);
  expect(z.decode(codec, "0")).toBe(0);
  expect(z.decode(codec, "-123")).toBe(-123);

  // Test encode
  expect(z.encode(codec, 42)).toBe("42");
  expect(z.encode(codec, 0)).toBe("0");
  expect(z.encode(codec, -123)).toBe("-123");

  // Test round trip
  const original = "999";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe("999");
});

test("stringToBigInt codec", () => {
  const codec = stringToBigInt();

  // Test decode
  expect(z.decode(codec, "123456789012345678901234567890")).toBe(123456789012345678901234567890n);
  expect(z.decode(codec, "0")).toBe(0n);
  expect(z.decode(codec, "-999")).toBe(-999n);

  // Test encode
  expect(z.encode(codec, 123456789012345678901234567890n)).toBe("123456789012345678901234567890");
  expect(z.encode(codec, 0n)).toBe("0");
  expect(z.encode(codec, -999n)).toBe("-999");

  // Test round trip
  const original = "987654321098765432109876543210";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe("987654321098765432109876543210");
});

test("numberToBigInt codec", () => {
  const codec = numberToBigInt();

  // Test decode
  expect(z.decode(codec, 42)).toBe(42n);
  expect(z.decode(codec, 0)).toBe(0n);
  expect(z.decode(codec, -123)).toBe(-123n);

  // Test encode
  expect(z.encode(codec, 42n)).toBe(42);
  expect(z.encode(codec, 0n)).toBe(0);
  expect(z.encode(codec, -123n)).toBe(-123);

  // Test round trip
  const original = 999;
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe(999);
});

test("isoDatetimeToDate codec", () => {
  const codec = isoDatetimeToDate();

  // Test decode
  const decoded = z.decode(codec, "2024-01-15T10:30:00.000Z");
  expect(decoded).toBeInstanceOf(Date);
  expect(decoded.getTime()).toBe(1705314600000);

  // Test encode
  const date = new Date("2024-01-15T10:30:00.000Z");
  expect(z.encode(codec, date)).toBe("2024-01-15T10:30:00.000Z");

  // Test round trip
  const original = "2024-12-25T15:45:30.123Z";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe("2024-12-25T15:45:30.123Z");
});

test("epochSecondsToDate codec", () => {
  const codec = epochSecondsToDate();

  // Test decode
  const decoded = z.decode(codec, 1705314600);
  expect(decoded).toBeInstanceOf(Date);
  expect(decoded.getTime()).toBe(1705314600000);

  // Test encode
  const date = new Date(1705314600000);
  expect(z.encode(codec, date)).toBe(1705314600);

  // Test round trip
  const original = 1640995200; // 2022-01-01 00:00:00 UTC
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe(1640995200);
});

test("epochMillisToDate codec", () => {
  const codec = epochMillisToDate();

  // Test decode
  const decoded = z.decode(codec, 1705314600000);
  expect(decoded).toBeInstanceOf(Date);
  expect(decoded.getTime()).toBe(1705314600000);

  // Test encode
  const date = new Date(1705314600000);
  expect(z.encode(codec, date)).toBe(1705314600000);

  // Test round trip
  const original = 1640995200123; // 2022-01-01 00:00:00.123 UTC
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe(1640995200123);
});

test("json codec", () => {
  const codec = json(z.object({ name: z.string(), age: z.number() }));

  // Test decode
  const decoded = z.decode(codec, '{"name":"Alice","age":30}');
  expect(decoded).toEqual({ name: "Alice", age: 30 });

  // Test encode
  const encoded = z.encode(codec, { name: "Bob", age: 25 });
  expect(encoded).toBe('{"name":"Bob","age":25}');

  // Test round trip
  const original = '{"name":"Charlie","age":35}';
  const parsed = z.decode(codec, original);
  const roundTrip = z.encode(codec, parsed);
  expect(JSON.parse(roundTrip)).toEqual(JSON.parse(original));
});

test("utf8ToBytes codec", () => {
  const codec = utf8ToBytes();

  // Test decode
  const decoded = z.decode(codec, "Hello, 世界!");
  expect(decoded).toBeInstanceOf(Uint8Array);
  expect(Array.from(decoded)).toEqual([72, 101, 108, 108, 111, 44, 32, 228, 184, 150, 231, 149, 140, 33]);

  // Test encode
  const bytes = new Uint8Array([72, 101, 108, 108, 111]);
  expect(z.encode(codec, bytes)).toBe("Hello");

  // Test round trip
  const original = "Hello, 世界! 🚀";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe(original);
});

test("bytesToUtf8 codec", () => {
  const codec = bytesToUtf8();

  // Test decode
  const bytes = new Uint8Array([72, 101, 108, 108, 111]);
  const decoded = z.decode(codec, bytes);
  expect(decoded).toBe("Hello");

  // Test encode
  const encoded = z.encode(codec, "Hello, 世界!");
  expect(encoded).toBeInstanceOf(Uint8Array);
  expect(Array.from(encoded)).toEqual([72, 101, 108, 108, 111, 44, 32, 228, 184, 150, 231, 149, 140, 33]);

  // Test round trip
  const original = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 228, 184, 150, 231, 149, 140, 33]);
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toEqual(original);
});

test("base64 codec", () => {
  const codec = base64();

  // Test decode
  const decoded = z.decode(codec, "SGVsbG8=");
  expect(decoded).toBeInstanceOf(Uint8Array);
  expect(Array.from(decoded)).toEqual([72, 101, 108, 108, 111]);

  // Test encode
  const bytes = new Uint8Array([72, 101, 108, 108, 111]);
  expect(z.encode(codec, bytes)).toBe("SGVsbG8=");

  // Test round trip
  const original = "SGVsbG8gV29ybGQh";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe(original);
});

test("base64urlToBytes codec", () => {
  const codec = base64urlToBytes();

  // Test decode
  const decoded = z.decode(codec, "SGVsbG8");
  expect(decoded).toBeInstanceOf(Uint8Array);
  expect(Array.from(decoded)).toEqual([72, 101, 108, 108, 111]);

  // Test encode
  const bytes = new Uint8Array([72, 101, 108, 108, 111]);
  expect(z.encode(codec, bytes)).toBe("SGVsbG8");

  // Test round trip with padding case
  const original = "SGVsbG9Xb3JsZA";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe(original);
});

test("hexToBytes codec", () => {
  const codec = hexToBytes();

  // Test decode
  const decoded = z.decode(codec, "48656c6c6f");
  expect(decoded).toBeInstanceOf(Uint8Array);
  expect(Array.from(decoded)).toEqual([72, 101, 108, 108, 111]);

  // Note: z.hex() doesn't accept 0x prefix, but our utility function can handle it
  // const decodedWithPrefix = z.decode(codec, "0x48656c6c6f");
  // expect(Array.from(decodedWithPrefix)).toEqual([72, 101, 108, 108, 111]);

  // Test encode
  const bytes = new Uint8Array([72, 101, 108, 108, 111]);
  expect(z.encode(codec, bytes)).toBe("48656c6c6f");

  // Test round trip
  const original = "deadbeef";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe("deadbeef");
});

test("stringToURL codec", () => {
  const codec = stringToURL();

  // Test decode
  const decoded = z.decode(codec, "https://example.com/path?query=value");
  expect(decoded).toBeInstanceOf(URL);
  expect(decoded.hostname).toBe("example.com");
  expect(decoded.pathname).toBe("/path");
  expect(decoded.search).toBe("?query=value");

  // Test encode
  const url = new URL("https://example.com/path?query=value");
  expect(z.encode(codec, url)).toBe("https://example.com/path?query=value");

  // Test round trip
  const original = "https://test.com/api/v1?foo=bar&baz=qux";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe(original);
});

test("stringToHttpURL codec", () => {
  const codec = stringToHttpURL();

  // Test decode HTTPS
  const decodedHttps = z.decode(codec, "https://example.com/path");
  expect(decodedHttps).toBeInstanceOf(URL);
  expect(decodedHttps.protocol).toBe("https:");

  // Test decode HTTP
  const decodedHttp = z.decode(codec, "http://example.com/path");
  expect(decodedHttp).toBeInstanceOf(URL);
  expect(decodedHttp.protocol).toBe("http:");

  // Test encode
  const url = new URL("https://example.com/path");
  expect(z.encode(codec, url)).toBe("https://example.com/path");

  // Test round trip
  const original = "http://api.example.com/v1/users";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe(original);
});

test("uriComponent codec", () => {
  const codec = uriComponent();

  // Test decode
  const decoded = z.decode(codec, "Hello%20World%21");
  expect(decoded).toBe("Hello World!");

  // Test encode
  const encoded = z.encode(codec, "Hello World!");
  expect(encoded).toBe("Hello%20World!");

  // Test round trip
  const original = "Hello%20World%21%20%26%20More";
  const roundTrip = z.encode(codec, z.decode(codec, original));
  expect(roundTrip).toBe("Hello%20World!%20%26%20More");

  // Test complex characters
  const complex = "café & résumé";
  const encodedComplex = z.encode(codec, complex);
  const decodedComplex = z.decode(codec, encodedComplex);
  expect(decodedComplex).toBe(complex);
});

test("stringToBoolean codec", () => {
  const codec = stringToBoolean();

  // Test decode - default truthy values
  expect(z.decode(codec, "true")).toBe(true);
  expect(z.decode(codec, "yes")).toBe(true);
  expect(z.decode(codec, "1")).toBe(true);

  // Test decode - default falsy values
  expect(z.decode(codec, "false")).toBe(false);
  expect(z.decode(codec, "no")).toBe(false);
  expect(z.decode(codec, "0")).toBe(false);

  // Test encode - default behavior
  expect(z.encode(codec, true)).toBe("true");
  expect(z.encode(codec, false)).toBe("false");

  // Test custom options
  const customCodec = stringToBoolean({ truthy: ["yes", "y"], falsy: ["no", "n"] });
  expect(z.decode(customCodec, "yes")).toBe(true);
  expect(z.decode(customCodec, "y")).toBe(true);
  expect(z.decode(customCodec, "no")).toBe(false);
  expect(z.decode(customCodec, "n")).toBe(false);
  expect(z.encode(customCodec, true)).toBe("yes");
  expect(z.encode(customCodec, false)).toBe("no");
});

// Test error cases - these test input validation, not transform errors
test("codec input validation", () => {
  // Test invalid base64 format
  const base64Codec = base64();
  const invalidBase64Result = z.safeDecode(base64Codec, "invalid!@#");
  expect(invalidBase64Result.success).toBe(false);

  // Test invalid hex format
  const hexCodec = hexToBytes();
  const invalidHexResult = z.safeDecode(hexCodec, "gg");
  expect(invalidHexResult.success).toBe(false);

  // Test invalid URL format
  const urlCodec = stringToURL();
  const invalidUrlResult = z.safeDecode(urlCodec, "not a url");
  expect(invalidUrlResult.success).toBe(false);

  // Test invalid HTTP URL format
  const httpUrlCodec = stringToHttpURL();
  const invalidHttpResult = z.safeDecode(httpUrlCodec, "ftp://example.com");
  expect(invalidHttpResult.success).toBe(false);
});

// Test transform errors - these test errors added by transform functions
test("codec transform error handling", () => {
  // JSON codec that can fail during transform
  const jsonCodec = z.codec(z.string(), z.json(), {
    decode: (jsonString, ctx) => {
      try {
        return JSON.parse(jsonString);
      } catch (err: any) {
        ctx.issues.push({
          code: "invalid_format",
          format: "json",
          input: jsonString,
          message: err.message,
        });
        return z.NEVER;
      }
    },
    encode: (value) => JSON.stringify(value),
  });

  // Test successful JSON parsing
  const validResult = z.safeDecode(jsonCodec, '{"valid": "json"}');
  expect(validResult.success).toBe(true);
  if (validResult.success) {
    expect(validResult.data).toEqual({ valid: "json" });
  }

  // Test invalid JSON that should create a single "invalid_format" issue
  // Verifies that the transform error aborts before reaching the output schema
  const invalidResult = z.safeDecode(jsonCodec, '{"invalid":,}');
  expect(invalidResult.success).toBe(false);
  if (!invalidResult.success) {
    expect(invalidResult.error.issues).toMatchInlineSnapshot(`
      [
        {
          "code": "invalid_format",
          "format": "json",
          "message": "Unexpected token ',', "{"invalid":,}" is not valid JSON",
          "path": [],
        },
      ]
    `);
  }
});
