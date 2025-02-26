import type * as core from "@zod/core";
import { expectTypeOf, test } from "vitest";
import * as z from "zod";

test("first party switch", () => {
  const myType = z.string() as core.$ZodFirstPartySchemaTypes;
  const def = myType._def;
  switch (def.type) {
    case "string":
      break;
    case "number":
      break;
    case "bigint":
      break;
    case "boolean":
      break;
    case "date":
      break;
    case "symbol":
      break;
    case "undefined":
      break;
    case "null":
      break;
    case "any":
      break;
    case "unknown":
      break;
    case "never":
      break;
    case "void":
      break;
    case "array":
      break;
    case "object":
      break;
    case "interface":
      break;
    case "union":
      break;
    case "intersection":
      break;
    case "tuple":
      break;
    case "record":
      break;
    case "map":
      break;
    case "set":
      break;
    case "literal":
      break;
    case "enum":
      break;
    case "promise":
      break;
    case "optional":
      break;
    case "default":
      break;
    case "template_literal":
      break;
    case "custom":
      break;
    case "transform":
      break;
    case "nonoptional":
      break;
    case "readonly":
      break;
    case "nan":
      break;
    case "pipe":
      break;
    case "success":
      break;
    case "catch":
      break;
    case "file":
      break;
    default:
      expectTypeOf(def).toEqualTypeOf<never>();
  }
});
