import * as z from "zod/v4";

console.log(z.string().default("default").optional().parse(undefined)); // should return "default"

const a = z.string().length(5, {
  error(issue) {
    console.log(issue);
    return undefined;
  },
});

a.parse("1234");
