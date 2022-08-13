import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

test("first party switch", () => {
  const myType = z.string() as z.ZodFirstPartySchemaTypes;
  const def = myType._def;

  switch (def.typeName) {
    case z.ZodFirstPartyTypeKind.ZodString:
      break;
    case z.ZodFirstPartyTypeKind.ZodNumber:
      break;
    case z.ZodFirstPartyTypeKind.ZodNaN:
      break;
    case z.ZodFirstPartyTypeKind.ZodBigInt:
      break;
    case z.ZodFirstPartyTypeKind.ZodBoolean:
      break;
    case z.ZodFirstPartyTypeKind.ZodDate:
      break;
    case z.ZodFirstPartyTypeKind.ZodUndefined:
      break;
    case z.ZodFirstPartyTypeKind.ZodNull:
      break;
    case z.ZodFirstPartyTypeKind.ZodAny:
      break;
    case z.ZodFirstPartyTypeKind.ZodUnknown:
      break;
    case z.ZodFirstPartyTypeKind.ZodNever:
      break;
    case z.ZodFirstPartyTypeKind.ZodVoid:
      break;
    case z.ZodFirstPartyTypeKind.ZodArray:
      break;
    case z.ZodFirstPartyTypeKind.ZodObject:
      break;
    case z.ZodFirstPartyTypeKind.ZodUnion:
      break;
    case z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
      break;
    case z.ZodFirstPartyTypeKind.ZodIntersection:
      break;
    case z.ZodFirstPartyTypeKind.ZodTuple:
      break;
    case z.ZodFirstPartyTypeKind.ZodRecord:
      break;
    case z.ZodFirstPartyTypeKind.ZodMap:
      break;
    case z.ZodFirstPartyTypeKind.ZodSet:
      break;
    case z.ZodFirstPartyTypeKind.ZodFunction:
      break;
    case z.ZodFirstPartyTypeKind.ZodLazy:
      break;
    case z.ZodFirstPartyTypeKind.ZodLiteral:
      break;
    case z.ZodFirstPartyTypeKind.ZodEnum:
      break;
    case z.ZodFirstPartyTypeKind.ZodEffects:
      break;
    case z.ZodFirstPartyTypeKind.ZodNativeEnum:
      break;
    case z.ZodFirstPartyTypeKind.ZodOptional:
      break;
    case z.ZodFirstPartyTypeKind.ZodNullable:
      break;
    case z.ZodFirstPartyTypeKind.ZodDefault:
      break;
    case z.ZodFirstPartyTypeKind.ZodPromise:
      break;
    case z.ZodFirstPartyTypeKind.ZodBranded:
      break;
    default:
      util.assertNever(def);
  }
});
