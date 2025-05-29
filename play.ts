import { z } from "zod/v4";

const a = z.object({
  name: z.string(),
  age: z.number().int().positive(),
});

console.dir(
  z.toJSONSchema(a, {
    override(ctx) {
      const schema = ctx.zodSchema;
      if (schema instanceof z.core.$ZodObject && schema._zod.def.catchall === undefined) {
        delete ctx.jsonSchema.additionalProperties;
      }
    },
  }),
  { depth: null }
);

const arg = z.string().safeParse("hello"); // should not throw
z.treeifyError(arg.error!);

// import { z } from "zod/v4";

const output = z.string();

const aa = z.function();
type aa = Parameters<typeof aa._output>;

const itWorks = z.function({ input: [z.string()] }).implement(output.parse);
const itWorks2 = z.function({ input: [z.string()] }).implement((args) => output.parse(args));
const itWorks3 = z.function({ input: [z.string().default("")] }).implement(output.parse);
const itWorks4 = z.function({ input: [z.string()] }).implement((args) => output.parse(args));
const nope = z.function({ input: [z.string().default("")] }).implement((args) => output.parse(args));

type ItWorks = ReturnType<typeof itWorks>;
type ItWorks2 = ReturnType<typeof itWorks2>;
type ItWorks3 = ReturnType<typeof itWorks3>;
type ItWorks4 = ReturnType<typeof itWorks4>;
type Nope = ReturnType<typeof nope>; //unknown
