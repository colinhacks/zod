import { expect, test } from "vitest";
import * as z from "zod/mini";

const cyclic = (): any => {
  const input: any = { id: 1 };
  input.self = input;
  return input;
};

test("cyclic input needs the memoizer opt-in", () => {
  const Before: any = z.object({
    id: z.number(),
    get self() {
      return Before;
    },
  });
  expect(() => Before.parse(cyclic())).toThrow(RangeError);

  z.config({ memoizer: z.memoizer() });
  const After: any = z.object({
    id: z.number(),
    get self() {
      return After;
    },
  });
  const out = After.parse(cyclic());
  expect(out.self).toBe(out);
  expect(out).not.toBe(cyclic());
  // read at construction, so a schema built before the opt-in keeps none
  expect(() => Before.parse(cyclic())).toThrow(RangeError);
});

test("the opt-in reaches every core container", () => {
  z.config({ memoizer: z.memoizer() });
  const Arr: any = z.array(z.lazy(() => Arr));
  const input: any = [];
  input.push(input);
  const out = Arr.parse(input);
  expect(out[0]).toBe(out);
});
