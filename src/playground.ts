import * as z from '.';

const trimAndMultiply = z
  .transformer(z.string(), z.string(), x => {
    return x.trim();
  })
  .transform(z.number(), x => {
    return parseFloat(x);
  })
  .transform(z.number(), num => {
    return num * 5;
  })
  .refine(x => {
    return x > 20;
  }, 'Number is too small');

console.log(trimAndMultiply.parse(' 5 '));
type trimAndMultiply = z.infer<typeof trimAndMultiply>;

const stringToNumber = z.transformer(z.string(), z.number(), data => parseFloat(data));

const myFunc = z
  .function()
  .args(stringToNumber)
  .returns(z.boolean())
  .implement(num => num > 5);

myFunc(8);

// myFunc("8");
