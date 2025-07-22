import * as z from "zod";

const customRegistry = z.registry();
//
const schema1 = z.string();
console.log(customRegistry.get(schema1)); // undefined
//
const schema2 = z.string().meta({ title: "Schema" });
console.log(customRegistry.get(schema2)); // {}
//
const schema3 = z.string().register(z.globalRegistry, { title: "Schema" });
console.log(customRegistry.get(schema3)); // undefined
