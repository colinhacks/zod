import * as z from '.';

try {
  z.union([z.object({ a: z.number() }), z.object({ b: z.number() })]).parse({ t: 1 });
} catch (err) {
  if (err instanceof z.ZodError) {
    console.log(JSON.stringify(err.errors, null, 2));
  }
}

const errorMap: z.ZodErrorMap = (error, ctx) => {
  switch (error.code) {
    case z.ZodErrorCode.invalid_union:
      console.log('CUSTOM UNION ERROR ');
      error.unionErrors; // InvalidUnionError
      return { message: 'my custom union error' };
  }

  // fall back to default message
  return { message: ctx.defaultError };
};

z.string()
  .optional()
  .parseAsync(12, { errorMap })
  .catch(err => {
    console.log(err.message);
    // => "my custom union error"
  });

/* throws: 
  ZodError {
    errors: [{
      code: "invalid_type",
      path: [],
      message: "This ain't a string!",
      expected: "string",
      received: "number",
    }]
  }
*/
