import * as z from "zod/v4";

// console.log(z.string().safeParse(234).error);
z.string().parse(234);
// try {
//   z.string().parse(234);
// } catch (e) {
//   console.dir(e, { depth: null });
// }
