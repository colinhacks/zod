import { z } from "./index";

const run = async () => {
  z;
};

run();

export {};

const object = z.object({
  name: z.string(),
  age: z.number().optional(),
  field: z.string().optional().default(undefined),
});

const requiredObject = object.required();
console.log(requiredObject.shape.name instanceof z.ZodString);
console.log(requiredObject.shape.age instanceof z.ZodNumber);
console.log(requiredObject.shape.field instanceof z.ZodString);
