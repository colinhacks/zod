import * as z from "zod/v4";

// z.string().check(z.startsWith("asdf", "bad")).parse("qwer");

console.log(z.string().includes("Error")._zod.def);
