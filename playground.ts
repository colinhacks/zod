import { z } from "./src";

function foo<Schema extends z.AnyZodObject>(schema: Schema) {
  return z.object({ bar: schema }).transform((x) => x.bar);
  //                                                   ^^^
  // Property 'bar' does not exist on type
  // '{ [k in keyof baseObjectOutputType<{ bar: Schema; }>]: baseObjectOutputType<{ bar: Schema; }>[k]; }'.
}
