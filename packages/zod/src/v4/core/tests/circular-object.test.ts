import { test, expect } from "vitest";
import * as z from "zod/v4";

test("validates circular objects", () => {
  const userSchema = z.object({
    id: z.number(),
    get posts() {
      return z.array(postSchema);
    },
  });

  const postSchema = z.object({
    title: z.string(),
    get author() {
      return userSchema;
    },
  });

  const user = {
    id: 1,
    posts: [
      {
        title: "First",
        get author() {
          return user;
        },
      },
    ],
  };

  expect(userSchema.parse(user)).toEqual({
    id: 1,
    posts: [
      {
        title: "First",
        author: user,
      },
    ],
  });
});
