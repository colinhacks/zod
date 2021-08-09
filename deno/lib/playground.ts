import { z } from "./index.ts";

const maybeShortStr = z.string().min(5).or(z.undefined());

console.log(maybeShortStr.safeParse(undefined));
console.log(maybeShortStr.safeParse("1234"));
console.log(maybeShortStr.safeParse("12345"));
