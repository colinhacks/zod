import { test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("first party switch", () => {
  const myType = z.string() as z.ZodFirstPartySchemaTypes;
  const def = myType._def;

  switch (def.typeName) {
    case "ZodString":
      break;
    case "ZodNumber":
      break;
    case "ZodBigInt":
      break;
    case "ZodBoolean":
      break;
    case "ZodDate":
      break;
    case "ZodUndefined":
      break;
    case "ZodNull":
      break;
    case "ZodAny":
      break;
    case "ZodUnknown":
      break;
    case "ZodNever":
      break;
    case "ZodVoid":
      break;
    case "ZodArray":
      break;
    case "ZodObject":
      break;
    case "ZodUnion":
      break;
    case "ZodIntersection":
      break;
    case "ZodTuple":
      break;
    case "ZodRecord":
      break;
    case "ZodMap":
      break;
    case "ZodSet":
      break;
    case "ZodFunction":
      break;
    case "ZodLazy":
      break;
    case "ZodLiteral":
      break;
    case "ZodEnum":
      break;
    case "ZodEffects":
      break;
    case "ZodNativeEnum":
      break;
    case "ZodOptional":
      break;
    case "ZodNullable":
      break;
    case "ZodDefault":
      break;
    case "ZodPromise":
      break;
    default:
      util.assertNever(def);
  }
});
