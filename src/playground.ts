import * as z from '.';

z.object({
  paymentType: z.object({
    name: z.string(),
    minLimit: z.number(),
    maxLimit: z.number(),
  }),
  amount: z.number(),
}).refine(
  ({ paymentType, amount }) => amount <= paymentType.maxLimit,
  val => {
    return {
      message: `The value should be greater than or equal to ${val.paymentType.minLimit}`,
      path: ['amount'],
    };
  },
);

const transformArray = <T extends z.ZodTypeAny>(childSchema: T) => {
  const schema = z.object({
    elements: z.array(childSchema),
  });

  return z.transformer(schema, z.array(childSchema), val => {
    return val.elements;
  });
};

const classSchema = z.object({
  students: z.transformer(
    z.object({
      elements: z
        .object({
          id: z.number(),
        })
        .array(),
    }),
    z.array(
      z.object({
        id: z.number(),
      }),
    ),
    val => {
      return val.elements;
    },
  ),

  // transformArray(
  // z.object({
  //   id: z.number(),
  // }),
  // ),
});

const classesSchema = z.transformer(
  z.object({ elements: z.array(classSchema) }),
  z.array(classSchema),
  val => {
    return val.elements;
  },
);

const run = async () => {
  // const s1 = z
  //   .object({
  //     name: z.string().default('A'),
  //   })
  //   .default({});
  // s1;
  const stringToNumber = z
    .string()
    .transform(z.number(), val => parseFloat(val));
  const s2 = stringToNumber.default(12);
  console.log(s2.parse(undefined));

  const s3 = z.transformer(stringToNumber, stringToNumber, val => {
    return `${val}`;
  });
};
run();
