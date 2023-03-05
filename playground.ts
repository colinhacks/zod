import { z } from "./src";

const schema = z.object({ array: z.string().array().min(42) }).deepPartial();

console.log(schema.shape.array._def);
console.log(schema.shape.array._def.innerType._def.minLength);

// works as expected
console.log(schema.safeParse({}).success); // true

// should be false, but is true
console.log(schema.safeParse({ array: [] }).success); // true

console.log(z.string().array().min(42).safeParse([]).success);
