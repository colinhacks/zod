import * as z from "zod";

const mySchema = z.string();

// there is a global schema registry
z.globalRegistry; // => ZodRegistry<object, z.ZodType>

// register metadata (accepts `object`)
mySchema.meta({ name: "foo", whatever: "bar" });
// equivalent
z.globalRegistry.add(mySchema, { name: "foo", description: "bar" });

// retrive metadata
mySchema.meta(); // unknown (this is not typed)
// equivalent
z.globalRegistry.get(mySchema);

// metadata can be typed via custom registries
const myRegistry = z.registry<{ name: string; description: string }>();
// => ZodRegistry<{ name: string; description: string }>

// register typed metadata
mySchema.register(myRegistry, { name: "foo", description: "bar" });
// equivalent
z.globalRegistry.add(mySchema, { name: "foo", description: "bar" });

// retrive typed metadata
myRegistry.get(mySchema);
// => { name: string; description: string } | undefined
