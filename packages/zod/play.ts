import * as z from "zod";

z;

const a = z.object({
  a: z.string(),
});

a["~parse"];
const data = {
  a: "a",
};
console.log(a.safeParse(data));
