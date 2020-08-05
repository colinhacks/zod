import * as z from '.';

const ID = z.transformer(z.number(), z.string(), n => String(n));

z.object({
  id: ID,
}).parse({ id: 5 }); // => { id: '5' }

z.string()
  .default('asdf')
  .parse(undefined); // => "asdf"
