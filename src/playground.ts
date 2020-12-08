import * as z from '.';

const callback = (predicate: (val: string) => boolean) => {
  return predicate('hello');
};

console.log(callback(z.string().check)); // false!?
console.log(callback(value => z.string().check(value))); // true
