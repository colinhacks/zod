import * as z from "./src/api.js";

const a = z.uuid();
console.log(a);
console.log(a.parse("123"));
