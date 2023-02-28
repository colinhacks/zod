import { z } from "./src";

const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), b: z.number() }),
  z.object({ type: z.literal("b"), c: z.number() }),
  z.object({ type: z.literal("c"), d: z.number() }),
  z.object({ type: z.null(), e: z.number() }),
  z.object({ type: z.undefined(), f: z.number() }),
  z.object({ type: z.boolean(), g: z.number() }),
  z.object({ type: z.number(), h: z.number() }),
  z.object({ type: z.array(z.string()), k: z.number() }),
  z.object({ type: z.record(z.string()), l: z.number() }),
  z.object({ type: z.tuple([z.string(), z.number()]), m: z.number() }),
  z.object({ type: z.enum(["asdf"]), n: z.number() }),
]);

console.log(`schema.parse({ type: "a", b: 1 });`);
schema.parse({ type: "a", b: 1 });
console.log(`schema.parse({ type: "b", c: 1 });`);
schema.parse({ type: "b", c: 1 });
console.log(`schema.parse({ type: "c", d: 1 });`);
schema.parse({ type: "c", d: 1 });
console.log(`schema.parse({ type: null, e: 1 });`);
schema.parse({ type: null, e: 1 });
console.log(`schema.parse({ type: undefined, f: 1 });`);
schema.parse({ type: undefined, f: 1 });
console.log(`schema.parse({ type: true, g: 1 });`);
schema.parse({ type: true, g: 1 });
console.log(`schema.parse({ type: false, g: 1 });`);
schema.parse({ type: false, g: 1 });
console.log(`schema.parse({ type: 1, h: 1 });`);
schema.parse({ type: 1, h: 1 });
console.log(`schema.parse({ type: ["asdf"], k: 1 });`);
schema.parse({ type: ["asdf"], k: 1 });
console.log(`schema.parse({ type: { asdf: "asdf" }, l: 1 });`);
schema.parse({ type: { asdf: "asdf" }, l: 1 });
console.log(`schema.parse({ type: ["asdf", 1], m: 1 });`);
schema.parse({ type: ["asdf", 1], m: 1 });
console.log(`schema.parse({ type: "asdf", n: 1 });`);
schema.parse({ type: "asdf", n: 1 });
