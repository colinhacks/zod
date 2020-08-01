import * as z from '.';

// const User = z.lazy(() => z.object({ posts: z.array(Post) }))
// const Post = z.lazy(() => z.object({ author: User }))


// const myObj = z.object({
//   name: z.string(),
//   neutered: z.boolean()
// }).nonstrict();

// const restStrings = z.record(z.number());

// const merged = z.intersection(myObj, restStrings);
// type merged = z.infer<typeof merged>

// const asdf: merged = { name: 'asdf', qwer: 1234 }




console.log(
  z
    .object({
      number: z.transformer(z.string(), z.number(), data => parseFloat(data)),
    })
    .parse({ number: '12' }),
);

const asdf = z
  .any()
  .transform(z.string(), x => x || 'asdf')
  .transform(z.string(), x => String(x))
  .transform(z.string(), x => x.toUpperCase());

console.log(asdf.parse(undefined));
// => 'ASDF'

const baseSchema = z.object({
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.union([z.undefined(), z.string()]),
  otherName: z.union([z.string(), z.undefined(), z.string()]),
});

const reqBase = baseSchema.require();
reqBase;
// const ewr = reqBase.shape;
// console.log(ewr);

// type baseInput = z.input<typeof baseSchema>;
// type baseOutput = z.output<typeof baseSchema>;

// const sdf = z.union([z.string(), z.number()]);
// const qwer = sdf.options;
// const poiu = qwer.filter(x => x instanceof z.ZodString);
