import * as z from '.';
let e = new Error('x');
console.log(z.object({ message: z.string() }).parse(e));
