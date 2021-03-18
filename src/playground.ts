import { z } from "./index";

const run = async () => {
  z;

  const postSchema = z.object({
    message: z.string().min(10),
    tags: z.string().email().array().max(3),
  });

  const asdf = postSchema.safeParse({
    message: "asdf",
    tags: ["asdf", "asdf", "asdf", "asdf"],
  });
  if (!asdf.success) {
    console.log(asdf.error.format()); //.tags?._errors;
  }
};

run();

export {};
