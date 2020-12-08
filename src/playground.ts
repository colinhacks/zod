import * as z from ".";
const someSchema = z
  .object({
    name: z.string().nonempty("name required."),
    lower_bound: z.number(),
    upper_bound: z.number(),
  })
  .refine((val) => val.lower_bound < val.upper_bound, {
    message: "Upper bound must be greater than lower bound.",
    path: ["lower_bound", "upper_bound"],
  });

console.log(
  someSchema.safeParse({ name: "", lower_bound: 100, upper_bound: 0 })
);
