import * as z from "zod/v4";

// const category = z.object({
//   name: z.string(),
//   get subcategories() {
//     return z.array(category);
//   },
// });

// console.dir(
//   z.toJSONSchema(z.object({ outer: category }), {
//     cycles: "throw",
//   }),
//   { depth: null }
// );

const A = z.object({
  name: z.string(),
  get subcategories() {
    return z.array(B);
  },
});

const B = z.object({
  name: z.string(),
  get subcategories() {
    return z.array(A);
  },
});

console.dir(z.toJSONSchema(A, { cycles: "throw" }), { depth: null });
