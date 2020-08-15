// import * as z from '.';
import { PseudoPromise } from '../PseudoPromise';

test('sync pass', () => {
  const myProm = new PseudoPromise()
    .then(() => 15)
    .then(arg => arg.toString())
    .then(arg => arg.length);
  expect(myProm.toValue()).toEqual(2);
});

test('sync fail', () => {
  const myProm = new PseudoPromise()
    .then(async () => 15)
    .then(arg => arg.toString())
    .then(arg => arg.length);

  expect(() => myProm.toValue()).toThrow();
});

test('pseudopromise all', async () => {
  const myProm = PseudoPromise.all([new PseudoPromise().then(() => 'asdf'), PseudoPromise.resolve(12)]).toPromise();
  expect.assertions(1);
  const val = await myProm;
  expect(val).toEqual(['asdf', 12]);
});

test('.resolve sync ', () => {
  expect(PseudoPromise.resolve(12).toValue()).toEqual(12);
});

test('.resolve async', () => {
  expect.assertions(1);

  PseudoPromise.resolve(Promise.resolve(12))
    .toPromise()
    .then(val => expect(val).toEqual(12));
});

test('sync and async', () => {
  expect.assertions(2);
  expect(PseudoPromise.resolve(15).toValue()).toEqual(15);
  PseudoPromise.resolve(15)
    .toPromise()
    .then(val => expect(val).toEqual(15));
});

test('object', async () => {
  PseudoPromise.object({
    asdf: PseudoPromise.resolve(15),
    qwer: new PseudoPromise().then(async () => 'asdfadsf'),
  });

  expect.assertions(1);
  const asdf = new PseudoPromise().then(async () => 'asdf');
  await PseudoPromise.all([asdf])
    .toPromise()
    .then(val => expect(val).toEqual(['asdf']));
});
