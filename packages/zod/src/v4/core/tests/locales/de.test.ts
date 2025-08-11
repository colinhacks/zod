import { beforeAll, expect, test } from "vitest";
import { type ZodType, z } from "zod/v4";

import de from "../../../locales/de.js";

beforeAll(() => z.config(de()));

test("invalid type localization", () => {
  expect(validate(z.string(), null)).toBe("Wert erforderlich");
  expect(validate(z.string(), undefined)).toBe("Wert erforderlich");
  expect(validate(z.string(), 1)).toBe("Ungültige Eingabe: erwartet string, erhalten Zahl");
});

function validate(schema: ZodType, value: any): string | null {
  const error = schema.safeParse(value).error;
  return error?.issues ? error.issues[0]!.message : null;
}
