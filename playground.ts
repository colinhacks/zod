import { z } from "./src";

z;

const _enum = z.enum(["Red", "Green", "Blue"]);

const a1 = _enum.exclude(["Red"]);
console.log(a1.safeParse("Green"));
console.log(a1.safeParse("Red"));

const a2 = _enum.exclude("Red");
console.log(a2.safeParse("Green"));
console.log(a2.safeParse("Red"));
