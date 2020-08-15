import * as z from '.';
import { PseudoPromise } from './PseudoPromise';
// import { PseudoPromise } from './PseudoPromise';

const run1 = async () => {
  console.log('starting async parse');
  z.object({
    password: z.string(),
    confirm: z.string(),
  })
    .refine(data => data.confirm === data.password, { path: ['confirm'] })
    .parseAsync({ password: 'asdf', confirm: 'qewr' })
    .then(v => {
      console.log('FINAL');
      console.log(v);
    });
};

const run2 = async () => {
  const prom = PseudoPromise.object({
    asdf: PseudoPromise.resolve(32),
  });

  console.log(await prom.toValue());

  console.log('prom');
  console.log(prom);
  console.log('prom.toValue');
  console.log(prom.toValue);
  console.log('prom.toValue()');
  console.log(prom.toValue());
  console.log('PseudoPromise.resolve(prom.toValue())');
  console.log(PseudoPromise.resolve(prom.toValue()));
  console.log('PseudoPromise.resolve(prom.toValue()).toValue');
  console.log(PseudoPromise.resolve(prom.toValue()).toValue);
  console.log('PseudoPromise.resolve(prom.toValue()).toValue()');
  console.log(PseudoPromise.resolve(prom.toValue()).toValue());
  const result = await PseudoPromise.resolve(prom.toValue()).toValue();
  console.log(result);

  const pp1 = PseudoPromise.resolve(Promise.resolve('qwer'));
  console.log(await pp1.toValue());
};

run1;
run2;

run1();
