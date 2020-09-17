import * as z from '.';

const tagsA = z.enum(['a', 'b', 'c']); // type tagsA = 'a' | 'b' | 'c'
const tagsB = z.enum(['b', 'c', 'd']); // type tagsB = 'b' | 'c' | 'd'

const bOrC = z.intersection(tagsA, tagsB); // ('a' | 'b' | 'c') & ('b' | 'c' | 'd')
type bOrC = z.infer<typeof bOrC>; // 'b' | 'c'

console.log(bOrC.safeParse('a'));
console.log(bOrC.safeParse('b'));
console.log(bOrC.safeParse('c'));
console.log(bOrC.safeParse('d'));
