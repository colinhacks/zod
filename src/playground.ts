import * as z from '.';

const run = async () => {
  const dynamicRefine = z.string().refine(
    val => val === val.toUpperCase(),
    val => ({ params: { val } }),
  );

  console.log(dynamicRefine.safeParse('asdf'));
};

run();
