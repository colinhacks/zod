// // @ts-ignore TS6133
// import { expect, test } from "@jest/globals";

// import { util } from "../helpers/util";
// import * as z from "../index";
// import { ZodIssueCode } from "../ZodError";

// test("refinement", () => {
//   const obj1 = z.object({
//     first: z.string(),
//     second: z.string(),
//   });
//   const obj2 = obj1.partial().strict();

//   const obj3 = obj2.refine(
//     (data) => data.first || data.second,
//     "Either first or second should be filled in."
//   );

//   expect(obj1 === (obj2 as any)).toEqual(false);
//   expect(obj2 === (obj3 as any)).toEqual(false);

//   expect(() => obj1.parse({})).toThrow();
//   expect(() => obj2.parse({ third: "adsf" })).toThrow();
//   expect(() => obj3.parse({})).toThrow();
//   obj3.parse({ first: "a" });
//   obj3.parse({ second: "a" });
//   obj3.parse({ first: "a", second: "a" });
// });
