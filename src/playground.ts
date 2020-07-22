import * as z from '.';

const trimAndMultiply = z.ZodCodec.fromSchema(z.string())
  .transform(z.number(), x => parseFloat(x))
  .transform(z.number(), num => num * 5)
  .refine(x => {
    console.log(`x: ${x}`);
    return x > 30;
  }, 'Number is too small');

console.log(trimAndMultiply.parse('5'));

type trimAndMultiply = z.infer<typeof trimAndMultiply>;
