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

interface RouteDefinition<I, O, P> {
  path: string;
  method?: string;
  validate?: {
    input?: z.ZodType<I>;
    output?: z.ZodType<O>;
    params?: z.ZodType<P>;
  };
  // resolve(ctx: P): Promise<O>;
}

const route = <T extends RouteDefinition<any, any, any>>(arg: T) => {
  return arg;
};

const params = z.object({
  id: z.transformer(z.string(), z.number(), (x) => Number(x)),
});

route({
  path: "adf",
  method: "POST",
  validate: {
    input: params,
    output: params,
    params: params,
  },
  // resolve:
});
