// // @ts-ignore TS6133
// import { expect, test } from "vitest";

// import * as z from "zod";

// const unique = z.string().array().unique();
// const uniqueArrayOfObjects = z
//   .array(z.object({ name: z.string() }))
//   .unique({ identifier: (item) => item.name });

// test("continue parsing despite array of primitives uniqueness error", () => {
//   const schema = z.number().array().unique();

//   const result = schema.safeParse([1, 1, 2, 2, 3]);

//   expect(result.success).toEqual(false);
//   if (!result.success) {
//     const issue = result.error.issues.find(({ code }) => code === "not_unique");
//     expect(issue?.message).toEqual("Values must be unique");
//   }
// });

// test("continue parsing despite array of objects not_unique error", () => {
//   const schema = z.array(z.object({ name: z.string() })).unique({
//     identifier: (item) => item.name,
//     showDuplicates: true,
//   });

//   const result = schema.safeParse([
//     { name: "Leo" },
//     { name: "Joe" },
//     { name: "Leo" },
//   ]);

//   expect(result.success).toEqual(false);
//   if (!result.success) {
//     const issue = result.error.issues.find(({ code }) => code === "not_unique");
//     expect(issue?.message).toEqual("Element(s): 'Leo' not unique");
//   }
// });

// test("returns custom error message without duplicate elements", () => {
//   const schema = z.number().array().unique({ message: "Custom message" });

//   const result = schema.safeParse([1, 1, 2, 2, 3]);

//   expect(result.success).toEqual(false);
//   if (!result.success) {
//     const issue = result.error.issues.find(({ code }) => code === "not_unique");
//     expect(issue?.message).toEqual("Custom message");
//   }
// });

// test("returns error message with duplicate elements", () => {
//   const schema = z.number().array().unique({ showDuplicates: true });

//   const result = schema.safeParse([1, 1, 2, 2, 3]);

//   expect(result.success).toEqual(false);
//   if (!result.success) {
//     const issue = result.error.issues.find(({ code }) => code === "not_unique");
//     expect(issue?.message).toEqual("Element(s): '1,2' not unique");
//   }
// });

// test("returns custom error message with duplicate elements", () => {
//   const schema = z
//     .number()
//     .array()
//     .unique({
//       message: (item) => `Custom message: '${item}' are not unique`,
//       showDuplicates: true,
//     });

//   const result = schema.safeParse([1, 1, 2, 2, 3]);

//   expect(result.success).toEqual(false);
//   if (!result.success) {
//     const issue = result.error.issues.find(({ code }) => code === "not_unique");
//     expect(issue?.message).toEqual("Custom message: '1,2' are not unique");
//   }
// });
