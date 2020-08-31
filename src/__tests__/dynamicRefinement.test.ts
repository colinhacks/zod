import * as z from '../index';
import { ZodError } from '../index';
// @ts-ignore
import { performance } from 'perf_hooks';

test('dynamicRefinement', () => {
  enum DataType {
    STRING = 'STRING',
    INT = 'NUMBER',
  }

  const formSchema = z
    .object({
      // @ts-ignore
      type: z.nativeEnum(DataType),
      constraints: z.object({
        max: z.number().optional(),
      }),
      value: z.union([z.string(), z.number()]),
    })
    .dynamicRefinement((zodError, value) => {
      let schema: z.ZodTypeAny = z.unknown();
      switch (value.type) {
        case DataType.INT:
          if (value.constraints.max != undefined) {
            schema = z
              .number()
              .max(value.constraints.max)
              .int();
          }
          break;
        case DataType.STRING:
          break;
      }
      try {
        schema.parse(value.value);
        return;
      } catch (error) {
        if (error instanceof ZodError) {
          zodError.addErrors(error.errors.map(e => ({ ...e, path: ['value'] })));
        }
      }
    });

  const outputSchema = formSchema.omit({ constraints: true });

  const transform = (input: z.infer<typeof formSchema>): z.infer<typeof outputSchema> => {
    const { constraints, ...clean } = input;
    return clean;
  };

  //   const time = performance.now();
  try {
    const validValue = formSchema.parse({ type: DataType.INT, value: 10.1, constraints: { max: 10 } });
    const outputValue = transform(validValue);
    console.log('Valid:', outputValue);
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(JSON.stringify(error.errors, null, 2));
    } else {
      throw error;
    }
  }
  //   console.log(performance.now() - time);
});
