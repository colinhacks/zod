import { z } from "zod/v4";

const enumSchema = z.enum(["a", "b", "c"]);
const nativeEnumSchema = z.nativeEnum(enumSchema.enum);

console.dir(nativeEnumSchema.safeParse("a"), { depth: null }); // Valid
console.dir(nativeEnumSchema.safeParse("d"), { depth: null }); // Throws ZodError

z.file().mime([""]);

// function makeZodObj<const T extends string>(key: T) {
//   const a: string = "a";
//   const b: string = "b";
//   return z.looseObject({
//     [a]: z.string(),
//     [b]: z.number(),
//   });
// }

function makeZodObj<K extends string>(key: K) {
  return z.record(z.literal(key), z.string());
}

const schema = makeZodObj("foo");
type schema = z.infer<typeof schema>;
// { foo: string; }
