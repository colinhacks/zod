import { z } from "./index.ts";

const run = async () => {
  z;

  type Meta = { graphqlMapping: string };
  type AnyObject = z.ZodTypeAny;
  type AugmentSchema<T extends z.ZodTypeAny = z.ZodTypeAny> = T & Meta;
  function augment<T extends AnyObject>(
    schema: T,
    metadata: Meta
  ): AugmentSchema<T> {
    (schema as any).meta = metadata;
    return schema as any;
  }

  const User1 = z.object({
    name: augment(z.string(), { graphqlMapping: "Name" }),
  });

  User1.shape.name.graphqlMapping;

  const User = z.object({ name: z.string() });
  const Person = z.object({ age: z.number() });
  const models = [User, Person];
  for (const model of models) {
    for (const fieldName of Object.keys(model.shape)) {
      const field = (model.shape as any)[fieldName];
      const name = field?.metadata?.graphqlMapping || fieldName; // TypeError;
      // do stuff;
    }
  }

  type Field = { schema: z.ZodTypeAny; graphqlMapping?: string };
  type Model = { [k: string]: Field };
  function model<Fields extends Model>(fields: Fields) {
    return fields;
  }

  const MyUser = model({
    name: { schema: z.string(), graphqlMapping: "Name" },
    age: { schema: z.number() },
  });

  const models2: Model[] = [MyUser];
  for (const model of models2) {
    for (const [_fieldName, field] of Object.entries(model)) {
      field.schema instanceof z.ZodString;
      field.graphqlMapping; // string | undefined
    }
  }

  const stringSchema = augment(User, { graphqlMapping: "asdf" });

  const Animal = z.object({
    properties: z.object({
      is_animal: z.boolean(),
    }),
  });

  const Cat = z
    .object({
      properties: z.object({
        jumped: z.boolean(),
      }),
    })
    .and(Animal);

  type Cat = z.infer<typeof Cat>;
  // const cat:Cat = 'asdf' as any;
  const cat = Cat.parse({ properties: { is_animal: true, jumped: true } });
  console.log(cat.properties);
  console.log(cat.properties);
};

run();

export {};
