import * as z from '.';
import { util } from './helpers/util';

type User = {
  name: string;
  age?: number | undefined;
  active: boolean | null;
  posts: Post[];
};

type Post = {
  content: string;
  author: User;
};

export const User: z.toZod<User> = z.lazy.object(() => ({
  name: z
    .string()
    .min(5)
    .max(2314)
    .refine(() => false, 'asdf'),
  age: z.number().optional(),
  active: z.boolean().nullable(),
  posts: z.array(Post),
}));

export const Post: z.toZod<Post> = z.lazy.object(() => ({
  content: z.string(),
  author: User,
}));

type genUser = z.infer<typeof User>;
type genPost = z.infer<typeof Post>;
const t1: util.AssertEqual<User, genUser> = true;
const t2: util.AssertEqual<Post, genPost> = true;
t1;
t2;
