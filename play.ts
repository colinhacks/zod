import * as z from "zod";
// type LinkedList = null | { value: number; next: LinkedList };

const E = z.interface({
  name: z.string(),
  get "e?"() {
    return E;
  },
});

z.preprocess((val, ctx) => {
  ctx.addIssue("bad stuff");
}, z.string());

const schema = z.string();

const data = "asdf";

data satisfies z.infer<typeof schema>;
