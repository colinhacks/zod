import * as z from "zod/v4";

const jsonCodec = z.codec(z.string(), z.json(), {
  decode: (jsonString, ctx) => {
    try {
      return JSON.parse(jsonString);
    } catch (_) {
      ctx.issues.push({
        code: "invalid_format",
        format: "json",
        input: jsonString,
      });
      return z.NEVER;
    }
  },
  encode: (value) => JSON.stringify(value),
});

// to further validate the resulting JSON data
// pipe the result into another schema
const myCodec = jsonCodec.pipe(z.object({ name: z.string(), age: z.number() }));
z.decode(myCodec, '{"name":,"age":30}'); // => { name: "Alice", age: 30 }
z.encode(myCodec, { name: "Bob", age: 25 }); // => '{"name":"Bob","age":25}'
