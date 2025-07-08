import { z } from "zod/v4";

const myRegistry = z.registry<{ id: string }>();
const User = z.object({
  name: z.string(),
  get posts() {
    return z.array(Post);
  },
});

const Post = z.object({
  title: z.string(),
  content: z.string(),
  get author() {
    return User;
  },
});

myRegistry.add(User, { id: "User" });
myRegistry.add(Post, { id: "Post" });

const result = z.toJSONSchema(myRegistry, { uri: (id) => `https://example.com/schemas/${id}.json` });
console.log(result);
