import * as z from "zod";

const a = z.uint32();
console.log(a.parse(1234));