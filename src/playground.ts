// import * as z from '.';

// export const TestObject = z
//   .object({
//     email: z.string(),
//     firstName: z.string(),
//     lastName: z.string(),
//   })
//   .nonstrict();

// // const asdf = TestObject.parse('doesntmatter');
// // export type TestObject = z.infer<typeof TestObject>;
// // const asfdwer:TestObject = "asdf" as any;

// const testUnion = z.object({ asdf: z.array(z.union([z.string(), z.number()])) });
// testUnion.parse({ asdf: [false] });
