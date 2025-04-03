// import { toJSONSchema } from "@zod/core";
import { z } from "zod";

const User = z
  .interface({
    name: z.string(),
    get posts() {
      return z.array(Post);
    },
  })
  .meta({ id: "User" });

const Post = z
  .interface({
    title: z.string(),
    content: z.string(),
    get author() {
      return User;
    },
  })
  .meta({ id: "Post" });

const result = z.toJSONSchema(z.globalRegistry, {
  uri: (id) => `https://example.com/${id}.json`,
});
console.dir(result, { depth: 5 });
