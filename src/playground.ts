import * as z from './index';

const myType = z.object({ name: z.string() });

const run = () => {
  const blob: unknown = 'MY_JSON_PAYLOAD';

  const result = myType.safeParse(blob);
  // { success: true; data: { name: string } }
  //  | { success: false; error: ZodError }

  z.string()
    .url()
    .parse(`http://nautil.us//issue/88/love--sex/the-hard-problem-of-breakfast`);
  // this acts as a type guard
  if (!result.success) {
    result.error;
    console.log(JSON.stringify(result.error, null, 2));
    return;
  }

  // underneath if statement result is now type { name: string }
  result.data.name.toUpperCase();
};

run();
