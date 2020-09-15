import * as z from '.';

const run = async () => {
  const numToString = z.transformer(z.number(), z.string(), async n =>
    String(n),
  );
  const data = await z
    .object({
      id: numToString,
    })
    .parseAsync({ id: 5 });

  console.log(data);
};

run();

// export type Foo<T> = {
//   name: string;
//   value: T;
// };

// const fooSchema = <T extends z.ZodTypeAny>(
//   valueSchema: T,
// ): z.ZodObject<{ name: z.ZodString; value: T }> =>
//   z.object({
//     name: z.string(),
//     value: valueSchema,
//   });

// const asdf = fooSchema(z.string());

// export type Foo<T> = {
//   name: string;
//   value: T;
// };

// const fooSchema = <T>(valueSchema: z.ZodSchema<T>) =>
//   z.object({
//     name: z.string(),
//     value: valueSchema,
//   });

//   const asdf = fooSchema(z.string());
