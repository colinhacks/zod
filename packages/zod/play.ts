import * as z from "zod";

z;

const schema = z.string().regex(/^\d+$/g);
// console.log(schema);
console.log(schema.safeParse("123"));
console.log(schema.safeParse("123"));
console.log(schema.safeParse("123"));
console.log(schema.safeParse("123"));
console.log(schema.safeParse("123"));

// const a = z.interface({
//   aa: z.string(),
//   "bb?": z.string(),
//   "?cc": z._default(z.string(), "c"),
// });

// const b = z.omit(a, {});

// const mySchema = z.string();

// // there is a global schema registry
// z.globalRegistry; // => ZodRegistry<unknown, z.ZodType>

// // add schema to registry w/ associated metadata
// z.globalRegistry.add(mySchema, { name: "foo", description: "bar" });
// // equivalent convenience method (returns mySchema)
// mySchema.meta({ name: "foo", whatever: "bar" });

// // global registry is untyped (accepts anything as metadata)
// z.globalRegistry.add(z.string(), "hello");
// z.globalRegistry.add(z.string(), 1234);
// z.globalRegistry.add(z.string(), { foo: "bar" });

// // to retrive metadata from global registry
// z.globalRegistry.get(mySchema); // returns metadata (type is `unknown`)
// // equivalent convenience method
// mySchema.meta();

// // for typed metadata, use a custom registry
// const myRegistry = z.registry<{ name: string; description: string }>();

// // register typed metadata
// myRegistry.add(mySchema, { name: "foo", description: "bar" });
// // equivalent convenience method (returns mySchema)
// mySchema.register(myRegistry, { name: "foo", description: "bar" });

// // retrive typed metadata
// myRegistry.get(mySchema);
// // => { name: string; description: string } | undefined

// // you can register your metadata "inline"
// const User = z.object({
//   name: z.string().register(myRegistry, {
//     name: "name",
//     description: "The name of the user",
//   }),
//   age: z.number().register(myRegistry, {
//     name: "age",
//     description: "The age of the user",
//   }),
// });
