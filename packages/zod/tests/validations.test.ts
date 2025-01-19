// @ts-ignore TS6133
import { expect, test } from "vitest";

import * as z from "../src/index.js";

test("array min", async () => {
  try {
    await z.array(z.string()).min(4).parseAsync([]);
  } catch (err) {
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "message": "Too small: expected array to have greater than 4 items",
          "minimum": 4,
          "origin": "array",
          "path": [],
        },
      ]
    `);
  }
});

test("array max", async () => {
  try {
    await z.array(z.string()).max(2).parseAsync(["asdf", "asdf", "asdf"]);
  } catch (err) {
    // ("Array must contain at most 2 element(s)");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "maximum": 2,
          "message": "Too big: expected array to have less than 2 items",
          "origin": "array",
          "path": [],
        },
      ]
    `);
  }
});

test("array length", async () => {
  try {
    await z.array(z.string()).length(2).parseAsync(["asdf", "asdf", "asdf"]);
  } catch (err) {
    // ("Array must contain exactly 2 element(s)");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "maximum": 2,
          "message": "Too big: expected array to have less than 2 items",
          "origin": "array",
          "path": [],
        },
      ]
    `);
  }

  try {
    await z.array(z.string()).length(2).parseAsync(["asdf"]);
  } catch (err) {
    // ("Array must contain exactly 2 element(s)");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "message": "Too small: expected array to have greater than 2 items",
          "minimum": 2,
          "origin": "array",
          "path": [],
        },
      ]
    `);
  }
});

test("string length", async () => {
  try {
    await z.string().length(4).parseAsync("asd");
  } catch (err) {
    // ("String must contain exactly 4 character(s)");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "message": "Too small: expected string to have greater than 4 characters",
          "minimum": 4,
          "origin": "string",
          "path": [],
        },
      ]
    `);
  }

  try {
    await z.string().length(4).parseAsync("asdaa");
  } catch (err) {
    // ("String must contain exactly 4 character(s)");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "maximum": 4,
          "message": "Too big: expected string to have less than 4 characters",
          "origin": "string",
          "path": [],
        },
      ]
    `);
  }
});

test("string min", async () => {
  try {
    await z.string().min(4).parseAsync("asd");
  } catch (err) {
    // ("String must contain at least 4 character(s)");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "message": "Too small: expected string to have greater than 4 characters",
          "minimum": 4,
          "origin": "string",
          "path": [],
        },
      ]
    `);
  }
});

test("string max", async () => {
  try {
    await z.string().max(4).parseAsync("aasdfsdfsd");
  } catch (err) {
    // ("String must contain at most 4 character(s)");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "maximum": 4,
          "message": "Too big: expected string to have less than 4 characters",
          "origin": "string",
          "path": [],
        },
      ]
    `);
  }
});

test("number min", async () => {
  try {
    await z.number().min(3).parseAsync(2);
  } catch (err) {
    // ("Number must be greater than or equal to 3");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "inclusive": true,
          "message": "Too small: expected number to be greater than or equal to 3",
          "minimum": 3,
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("number gte", async () => {
  try {
    await z.number().gte(3).parseAsync(2);
  } catch (err) {
    // ("Number must be greater than or equal to 3");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "inclusive": true,
          "message": "Too small: expected number to be greater than or equal to 3",
          "minimum": 3,
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("number gt", async () => {
  try {
    await z.number().gt(3).parseAsync(3);
  } catch (err) {
    // ("Number must be greater than or equal to 3");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "inclusive": false,
          "message": "Too small: expected number to be greater than 3",
          "minimum": 3,
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("number max", async () => {
  try {
    await z.number().max(3).parseAsync(4);
  } catch (err) {
    // ("Number must be less than or equal to 3");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "inclusive": true,
          "maximum": 3,
          "message": "Too big: expected number to be less than or equal to 3",
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("number lte", async () => {
  try {
    await z.number().lte(3).parseAsync(4);
  } catch (err) {
    // ("Number must be less than or equal to 3");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "inclusive": true,
          "maximum": 3,
          "message": "Too big: expected number to be less than or equal to 3",
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("number lt", async () => {
  try {
    await z.number().lt(3).parseAsync(3);
  } catch (err) {
    // ("Number must be less than or equal to 3");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "inclusive": false,
          "maximum": 3,
          "message": "Too big: expected number to be less than 3",
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("number nonnegative", async () => {
  try {
    await z.number().nonnegative().parseAsync(-1);
  } catch (err) {
    // ("Number must be greater than or equal to 0");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "inclusive": true,
          "message": "Too small: expected number to be greater than or equal to 0",
          "minimum": 0,
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("number nonpositive", async () => {
  try {
    await z.number().nonpositive().parseAsync(1);
  } catch (err) {
    // ("Number must be less than or equal to 0");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "inclusive": true,
          "maximum": 0,
          "message": "Too big: expected number to be less than or equal to 0",
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("number negative", async () => {
  try {
    await z.number().negative().parseAsync(1);
  } catch (err) {
    // ("Number must be less than 0");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "inclusive": false,
          "maximum": 0,
          "message": "Too big: expected number to be less than 0",
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("number positive", async () => {
  try {
    await z.number().positive().parseAsync(-1);
  } catch (err) {
    // ("Number must be greater than 0");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "inclusive": false,
          "message": "Too small: expected number to be greater than 0",
          "minimum": 0,
          "origin": "number",
          "path": [],
        },
      ]
    `);
  }
});

test("set min", async () => {
  try {
    await z.set(z.string()).min(4).parseAsync(new Set());
  } catch (err) {
    // ("Set must contain at least 4 element(s)");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_small",
          "message": "Too small: expected set to have greater than 4 items",
          "minimum": 4,
          "origin": "set",
          "path": [],
        },
      ]
    `);
  }
});

test("set max", async () => {
  try {
    await z
      .set(z.string())
      .max(4)
      .parseAsync(new Set(["a", "b", "c", "d", "e"]));
  } catch (err) {
    // ("Set must contain at least 4 element(s)");
    expect((err as z.ZodError).issues).toMatchInlineSnapshot(`
      [
        {
          "code": "too_big",
          "maximum": 4,
          "message": "Too big: expected set to have less than 4 items",
          "origin": "set",
          "path": [],
        },
      ]
    `);
  }
});

test("instantiation", () => {
  z.string().min(5);
  z.string().max(5);
  z.string().length(5);
  z.string().email();
  z.string().url();
  z.string().uuid();
  z.string().min(5, { message: "Must be 5 or more characters long" });
  z.string().max(5, { message: "Must be 5 or fewer characters long" });
  z.string().length(5, { message: "Must be exactly 5 characters long" });
  z.string().email({ message: "Invalid email address." });
  z.string().url({ message: "Invalid url" });
  z.string().uuid({ message: "Invalid UUID" });
});

test("int", async () => {
  const int = z.number().int();
  int.parse(4);
  expect(() => int.parse(3.5)).toThrow();
});
