import { z } from "./src";

const Type1 = z.object({});
let test1: z.infer<typeof Type1>;

const Type2 = Type1.extend({ b: z.string() });
let test2: z.infer<typeof Type2>;

const Type3 = Type2.extend({ c: z.string() });
let test3: z.infer<typeof Type3>;

const Type4 = Type3.extend({ Type3: z.string() });
let test4: z.infer<typeof Type4>;

const Type5 = Type4.extend({ Type4: z.string() });
let test5: z.infer<typeof Type5>;

const Type6 = Type5.extend({ Type5: z.string() });
let test6: z.infer<typeof Type6>;

const Type7 = Type6.extend({ Type6: z.string() });
let test7: z.infer<typeof Type7>;

const Type8 = Type7.extend({ Type7: z.string() });
let test8: z.infer<typeof Type8>;

const Type9 = Type8.extend({ Type8: z.string() });
let test9: z.infer<typeof Type9>;

const Type10 = Type9.extend({ Type9: z.string() });
let test10: z.infer<typeof Type10>;

const Type11 = Type10.extend({ Type10: z.string() });
let test11: z.infer<typeof Type11>;

const Type12 = Type11.extend({ Type11: z.string() });
let test12: z.infer<typeof Type12>;

const Type13 = Type12.extend({ Type12: z.string() });
let test13: z.infer<typeof Type13>;

const Type14 = Type13.extend({ Type13: z.string() });
let test14: z.infer<typeof Type14>;

const Type15 = Type14.extend({ Type14: z.string() });
let test15: z.infer<typeof Type15>;
