import { z } from "zod/v4";

z;

// const time = z.iso.datetime();
console.log("z.iso.datetime()");
console.log(z.iso.datetime()._zod.def.pattern);

console.log("z.iso.datetime({local: true})");
console.log(z.iso.datetime({ local: true })._zod.def.pattern);

console.log("z.iso.datetime({offset: true})");
console.log(z.iso.datetime({ offset: true })._zod.def.pattern);

console.log("z.iso.datetime({precision: z.TimePrecision.Minute})");
console.log(z.iso.datetime({ precision: z.TimePrecision.Minute })._zod.def.pattern);

console.log("z.iso.datetime({offset: true, local: true })");
console.log(z.iso.datetime({ offset: true, local: true })._zod.def.pattern);
