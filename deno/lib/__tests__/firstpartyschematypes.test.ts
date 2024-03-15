// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { ZodFirstPartySchemaTypes, ZodFirstPartyTypeKind } from "../index.ts";
import { util } from "../helpers/util.ts";

test("Identify missing [ZodFirstPartySchemaTypes]", () => {
  type ZodFirstPartySchemaForType<T extends ZodFirstPartyTypeKind> =
    ZodFirstPartySchemaTypes extends infer Schema
      ? Schema extends { _def: { typeName: T } }
        ? Schema
        : never
      : never;
  type ZodMappedTypes = {
    [key in ZodFirstPartyTypeKind]: ZodFirstPartySchemaForType<key>;
  };
  type ZodFirstPartySchemaTypesMissingFromUnion = keyof {
    [key in keyof ZodMappedTypes as ZodMappedTypes[key] extends { _def: never }
      ? key
      : never]: unknown;
  };

  util.assertEqual<ZodFirstPartySchemaTypesMissingFromUnion, never>(true);
});
