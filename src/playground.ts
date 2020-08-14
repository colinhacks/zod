// import * as z from '.';
import { PseudoPromise } from './PseudoPromise';

PseudoPromise.object({
  asdf: PseudoPromise.resolve(15),
  qwer: new PseudoPromise().then(() => 'asdfadsf'),
})
  .resolveAsync()
  .then(console.log);

// expect.assertions(1);

// PseudoPromise.allAsync([new PseudoPromise().then(async () => 'asdf')]).then(val => expect(val).toEqual('asdf'));

// const myProm = new PseudoPromise()
//   .then(async () => 15)
//   .then(arg => arg.toString())
//   .then(arg => arg.length);

// console.log(myProm.resolveSync());

// const run = async () => {
//   await z
//     .union([z.string(), z.number().int()])
//     .parseAsync(3.2)
//     .then(console.log)
//     .catch(_err => {
//       console.log('error! oh no!');
//     });
// };

// run();

// PseudoPromise.awaitObj({
//   asdf: PseudoPromise.resolve(15),
//   qwer: new PseudoPromise().then(async () => {
//     if (Math.random() > 0) throw new Error('asdfjasf');
//     return 'asdfadsf';
//   }),
// });

// PseudoPromise.all([new PseudoPromise().then(async () => 'asdf')]);
