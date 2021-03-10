import * as z from ".";

// const schema = z.union([
//   z.object({
//     a: z.string(),
//   }),
//   z.object({
//     b: z.boolean(),
//   }),
// ]);

// schema.parse({ b: "test" });

export {};

z.string().nonempty();
z.literal("");

enum test {
  A,
  B = "qwer",
}
const asdf = z.nativeEnum(test);
asdf.parse(test.A);
asdf.parse(test.B);
asdf.parse("qwer");
asdf.parse("qwert");
// asdf.parse('B');
