import * as z from "../index";

export const Test = z.object({
  f1: z.number(),
});

export type Test = z.infer<typeof Test>;

export const instanceOfTest: Test = {
  f1: 1,
};

export const TestMerge = z
  .object({
    f5: z.literal("literal").optional(),
  })
  .merge(Test);

export type TestMerge = z.infer<typeof TestMerge>;

export const instanceOfTestMerge: TestMerge = {
  f1: 1,
};

export const TestUnion = z.union([
  z.object({
    f2: z.literal("literal").optional(),
  }),
  Test,
]);

export type TestUnion = z.infer<typeof TestUnion>;

export const instanceOfTestUnion: TestUnion = {
  f1: 1,
};

export const TestPartial = Test.partial();

export type TestPartial = z.infer<typeof TestPartial>;

export const instanceOfTestPartial: TestPartial = {
  f1: 1,
};

export const filePath = __filename;
