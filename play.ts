import * as z from "zod/v4";

declare const declare: any;

declare({ id: "my_thing", description: "hello there" }).type("string");
declare({ description: "hello there" }).fn("string", ":", "number");
// with({description: 'hello there'}).fn("string", ":", "number");
// withMeta({description: 'hello there'}).fn("string", ":", "number");

const a = z.string().meta({ id: "asdf" });
const myRegistry = z.registry();

z.toJSONSchema(a, { metadata: myRegistry });
