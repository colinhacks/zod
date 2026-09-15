import { beforeEach, expect, test } from "vitest";
import * as z from "zod/mini";

// the config object lives on globalThis, so only file isolation protects it; pin the unset precondition explicitly
beforeEach(() => {
  delete z.config().memoizer;
});

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

test("rejects a cycle that closes through a transform", () => {
  z.config({ memoizer: z.memoizer() });
  const Inner: any = z.object({
    name: z.string(),
    get self() {
      return Wrapped;
    },
  });
  const Wrapped: any = z.pipe(
    Inner,
    z.transform((value: any) => ({ wrapped: value }))
  );

  const input: any = { name: "x" };
  input.self = input;

  expect(() => Wrapped.parse(input)).toThrow(/reference cycle/);
});

test("leaves a transform that is not on the cycle alone", () => {
  z.config({ memoizer: z.memoizer() });
  const Node: any = z.object({
    n: z.pipe(
      z.number(),
      z.transform((value: number) => value * 2)
    ),
    get self() {
      return Node;
    },
  });

  const input: any = { n: 21 };
  input.self = input;

  const result = Node.parse(input);
  expect(result.n).toBe(42);
  expect(result.self).toBe(result);
});
