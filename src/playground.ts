// import * as z from '.';

// const testUnion = z.object({ asdf: z.string(), qwer:z.any() }).nonstrict();
// const asdf = testUnion.parse({ asdf: [false] });
// asdf.qwerasdf;

// const test = z.object({ asdf: z.string() }).nonstrict()
// type test = z.infer<typeof test>;

// const x: test = { asdf: "asdf", qwer: 1234 } // should work

// const User = z.object({ username: z.string() });
// type User = z.infer<typeof User>;

// const user: User = User.nonstrict().parse("whatever");
