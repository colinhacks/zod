// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

/** Note
 * Since z.never() allows no values, z.not(z.never()) should allow all values, including undefined. Hence, there are no failing test cases for notNever.
 * There are no passing validation cases for notAny, as it should reject everything.
*/

// Set 1
const str = z.string().not();
const email = z.string().email().not();
const num = z.number().not();
const arr = z.array(z.string()).not();
const rec = z.record(z.string()).not();
const obj = z.object({ username: z.string() }).not();

// Set 2
const bigInt = z.bigint().not();
const bool = z.boolean().not();
const date = z.date().not();
const sym = z.symbol().not();
const undef = z.undefined().not();
const nul = z.null().not();
const voidSchema = z.void().not();
const anySchema = z.any().not();
const unknownSchema = z.unknown().not();
const neverSchema = z.never().not();

// Set 3
const notString = z.not(z.string());
const notNumber = z.not(z.number());
const notStringArray = z.not(z.array(z.string()));
const notRecord = z.not(z.record(z.string()));
const notObject = z.not(z.object({ username: z.string() }));

// Set 4
const notBigInt = z.not(z.bigint());
const notBoolean = z.not(z.boolean());
const notDate = z.not(z.date());
const notSymbol = z.not(z.symbol());
const notUndefined = z.not(z.undefined());
const notNull = z.not(z.null());
const notVoid = z.not(z.void());
const notAny = z.not(z.any());
const notUnknown = z.not(z.unknown());
const notNever = z.not(z.never());

test("passing validations", () => {
    // Set 1
    str.parse(1234);
    email.parse(1234);
    email.parse("abcd");
    num.parse("1234");
    arr.parse([1234]);
    rec.parse({ key: 1234 });
    obj.parse({ username: 1234 });

    // Set 2
    bigInt.parse(10);
    bool.parse(1234);
    date.parse("not a date");
    sym.parse("1234");
    undef.parse(null);
    nul.parse(undefined);
    voidSchema.parse(null);
    neverSchema.parse(undefined); // `z.never()` allows no values, so `notNever` can accept any value.

    // Set 3
    notString.parse(1234);
    notNumber.parse("1234");
    notStringArray.parse([1234]);
    notRecord.parse({ key: 1234 });
    notObject.parse({ username: 1234 });

    // Set 4
    notBigInt.parse(10);
    notBoolean.parse(1234);
    notDate.parse("not a date");
    notSymbol.parse("1234");
    notUndefined.parse(null);
    notNull.parse(undefined);
    notVoid.parse(null);
    notNever.parse(undefined); // `z.never()` allows no values, so `notNever` can accept any value.
});

test("failing validations", () => {
    // Set 1
    expect(() => str.parse("1234")).toThrow();
    expect(() => email.parse("sample@gmail.com")).toThrow();
    expect(() => num.parse(1234)).toThrow();
    expect(() => arr.parse(["1234"])).toThrow();
    expect(() => rec.parse({ key: "value" })).toThrow();
    expect(() => obj.parse({ username: "1234" })).toThrow();

    // Set 2
    expect(() => bigInt.parse(BigInt(10))).toThrow();
    expect(() => bool.parse(true)).toThrow();
    expect(() => date.parse(new Date())).toThrow();
    expect(() => sym.parse(Symbol("symbol"))).toThrow();
    expect(() => undef.parse(undefined)).toThrow();
    expect(() => nul.parse(null)).toThrow();
    expect(() => voidSchema.parse(undefined)).toThrow();
    expect(() => anySchema.parse(undefined)).toThrow(); // `z.any()` allows any value, so `notAny` should fail for any input.
    expect(() => unknownSchema.parse(undefined)).toThrow(); // Same as `z.any()`

    // Set 3
    expect(() => notString.parse("1234")).toThrow();
    expect(() => notNumber.parse(1234)).toThrow();
    expect(() => notStringArray.parse(["1234"])).toThrow();
    expect(() => notRecord.parse({ key: "value" })).toThrow();
    expect(() => notObject.parse({ username: "1234" })).toThrow();

    // Set 4
    expect(() => notBigInt.parse(BigInt(10))).toThrow();
    expect(() => notBoolean.parse(true)).toThrow();
    expect(() => notDate.parse(new Date())).toThrow();
    expect(() => notSymbol.parse(Symbol("symbol"))).toThrow();
    expect(() => notUndefined.parse(undefined)).toThrow();
    expect(() => notNull.parse(null)).toThrow();
    expect(() => notVoid.parse(undefined)).toThrow();
    expect(() => notAny.parse(undefined)).toThrow(); // `z.any()` allows any value, so `notAny` should fail for any input.
    expect(() => notUnknown.parse(undefined)).toThrow(); // Same as `z.any()`
});