import * as z from '.';

const run = async () => {
  console.log(
    z
      .string()
      .transform(val => val.replace('pretty', 'extremely'))
      .transform(val => val.toUpperCase())
      .transform(val => val.split(' ').join('👏'))
      .parse('zod 2 is pretty cool'),
  );

  const coercedString = z.unknown().transform(z.string(), val => `${val}`);
  console.log(typeof coercedString.parse(false));
  console.log(typeof coercedString.parse(12));
};

run();
