import { expect, test } from "vitest";
import * as z from "zod/v4";

test("locales - hy invalid_value", () => {
  z.config(z.locales.hy());

  // values[1] here printed "undefined" for every literal and one-value enum
  expect(z.literal("a").safeParse("b").error!.issues[0].message).toBe('Սխալ մուտքագրում․ սպասվում էր "a"');
  expect(z.enum(["only"]).safeParse("x").error!.issues[0].message).toBe('Սխալ մուտքագրում․ սպասվում էր "only"');

  // separate sentence, so it needs its own guard against drift
  expect(z.enum(["a", "b"]).safeParse("c").error!.issues[0].message).toBe(
    'Սխալ տարբերակ․ սպասվում էր հետևյալներից մեկը՝ "a"|"b"'
  );
});
