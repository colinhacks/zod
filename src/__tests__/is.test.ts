import { expect, test } from "@jest/globals";

import { z } from "..";

test("test is ", () => {
  const schema = z.object({ key1: z.string(), key2: z.number() });
  type ExpectedType = { key1: string; key2: number };

  const value = { key1: "a", key2: 5 } as unknown;

  expect.assertions(1);
  if (schema.is(value)) {
    const typeCheckedValue: ExpectedType = value;
    expect(typeCheckedValue).toBe(value);
  } else {
    //@ts-expect-error
    const typeCheckedValue: ExpectedType = value;
    // So that the "unused" error goes away
    expect(typeCheckedValue).toBe(value);
    expect(false).toBe(true);
  }
});
