import { z } from "./src";

const aaa = z.object({ a: z.string(), b: z.number() });
const bbb = aaa.extend({ b: z.string() });

const Type1 = z.object({ a: z.string() }).merge(z.object({ a: z.number() }));
type test1 = z.infer<typeof Type1>;

const Type2 = Type1.merge(z.object({ b: z.string() }));
type test2 = z.infer<typeof Type2>;

const Type3 = Type2.merge(z.object({ c: z.string() }));
type test3 = z.infer<typeof Type3>;

const Type4 = Type3.merge(z.object({ Type3: z.string() }));
type test4 = z.infer<typeof Type4>;

const Type5 = Type4.merge(z.object({ Type4: z.string() }));
type test5 = z.infer<typeof Type5>;

const Type6 = Type5.merge(z.object({ Type5: z.string() }));
type test6 = z.infer<typeof Type6>;

const Type7 = Type6.merge(z.object({ Type6: z.string() }));
type test7 = z.infer<typeof Type7>;

const Type8 = Type7.merge(z.object({ Type7: z.string() }));
type test8 = z.infer<typeof Type8>;

const Type9 = Type8.merge(z.object({ Type8: z.string() }));
type test9 = z.infer<typeof Type9>;

const Type10 = Type9.merge(z.object({ Type9: z.string() }));
type test10 = z.infer<typeof Type10>;

const Type11 = Type10.merge(z.object({ Type10: z.string() }));
type test11 = z.infer<typeof Type11>;

const Type12 = Type11.merge(z.object({ Type11: z.string() }));
type test12 = z.infer<typeof Type12>;

const Type13 = Type12.merge(z.object({ Type12: z.string() }));
type test13 = z.infer<typeof Type13>;

const Type14 = Type13.merge(z.object({ Type13: z.string() }));
type test14 = z.infer<typeof Type14>;

const Type15 = Type14.merge(z.object({ Type14: z.string() }));
type test15 = z.infer<typeof Type15>;

const Type16 = Type14.merge(z.object({ Type15: z.string() }));
type test16 = z.infer<typeof Type16>;

const arg = Type16.parse("asdf");
arg;
