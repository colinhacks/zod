import * as z from "zod";

// console.log(z.string().datetime().safeParse("2022-01-01T00:99:00Z")); // fails
//                                         ^
console.log(z.string().datetime({ offset: true }).safeParse("2022-01-01T00:00:00+99:00")); // passes
//                                               ^
