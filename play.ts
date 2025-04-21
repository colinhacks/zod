import * as z from "zod";
z;

// const a = z.string().meta({ id: "jobId", description: "a" });
// const b = a.describe("b");
// const c = b.describe("c");
// const d = c.describe("d");

// const result = z.toJSONSchema(
//   z.object({
//     a,
//     b,
//     b2: b,
//     c,
//     d,
//   })
// );
// console.log(JSON.stringify(result, null, 2));

// import * as z from "zod";

const User = z.interface({
  name: z.string(),
  get posts() {
    return z.array(Post);
  },
});

const Post = z.interface({
  title: z.string(),
  content: z.string(),
  get author() {
    return User;
  },
});

z.globalRegistry.add(User, { id: "User" });
z.globalRegistry.add(Post, { id: "Post" });

const reg = z.toJSONSchema(z.globalRegistry);
console.dir(reg, { depth: 10 });
