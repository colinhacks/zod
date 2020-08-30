import * as z from './index';

// const myType = z.object({ name: z.string() });

const run = () => {
  try {
    z.string().parse(134);
  } catch (err) {
    console.log(err);
  }
  // const t1 = z.object({
  //   name: z.string(),
  //   obj: z.object({}),
  //   arrayarray: z.array(z.array(z.string())),
  // });
  // const i1 = t1.primitives();
  // type i1 = z.infer<typeof i1>;
  // const f1: util.AssertEqual<i1, { name: string }> = true;
  // const i1 = t1.primitives();
};

run();
