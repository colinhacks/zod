import { z } from "zod/v4";

const MY_KEYS = ["foo", "bar", "baz"] as const;
const MY_BRAND = "Label";

const MyKeySchema = z.literal([...MY_KEYS]).brand(MY_BRAND);
const MyRecordSchema = z.record(MyKeySchema, z.number());
MyKeySchema._zod.values;

const myRecord = MyRecordSchema.parse({
  //  ^?
  foo: 1,
  bar: 2,
  baz: 3,
});

const foo = MyKeySchema.parse("foo") as any as "foo" & z.core.$brand<"Label">;

// this should work, as foo has been branded
const fooValue = myRecord[foo];
//    ^?

// this should be a type error, as "bar" hasn't been branded
const barValue = myRecord["bar"];
//    ^?

// this should work as myRecord has been parsed but im pretty sure thats impossible in ts
const bazValue = myRecord.baz;
//    ^?

type ZodSymbol<T extends z.ZodLiteral, L extends number | string | symbol> = symbol & z.core.$ZodBranded<T, L>;

type ZodSymbols<T extends z.core.$ZodBranded<z.ZodType, string>> = T extends z.core.$ZodBranded<infer U, infer _>
  ? U extends z.ZodLiteral<infer Lits>
    ? {
        // we create a mapped type here so we can just use [k in keyof ZodSymbols<T>] to iterate over the keys
        [k in Lits as k extends number | string | symbol ? ZodSymbol<U, k> : never]: never;
      }
    : never
  : never;

type MyLabelAsSymbols = ZodSymbols<typeof MyKeySchema>;
//   ^?

// this would be the output of parsing
type MyRecordFixed<T extends z.ZodRecord> = T["def"]["keyType"] extends z.core.$ZodBranded<
  z.ZodType,
  number | string | symbol
>
  ? {
      [k in keyof ZodSymbols<T["def"]["keyType"]>]: z.infer<T["def"]["valueType"]>;
    }
  : z.infer<T>;

type MyRecordWithBrandedKeys = MyRecordFixed<typeof MyRecordSchema>;
//   ^?

// pretend this would be returned by MyRecordWithBrandedKeys.parse
const myRecordWithBrandedKeys = {} as MyRecordWithBrandedKeys;

// @ts-expect-error pretend this exists
const MySymbolsSchema = z.symbol(["foo", "bar", "baz"] as const).brand("Label");

// pretend this works and returns ZodSymbol
const fooKey = MySymbolsSchema.parse("foo") as unknown as ZodSymbol<typeof MyKeySchema, "foo">;

// now we can use the symbol to access the record with branded keys
const fooValueFixed = myRecordWithBrandedKeys[fooKey];
//    ^?

const barValueFixed = myRecordWithBrandedKeys["bar"];
//    ^? // should be a type error, as "bar" is not branded

// note: property access will not work without branded keys - one has to get the symbol first
const bazValueFixed = myRecordWithBrandedKeys.baz;
