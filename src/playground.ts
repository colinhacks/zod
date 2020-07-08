import * as z from '.';

const run = async () => {
  const errorMap: z.ZodErrorMap = (error, ctx) => {
    /*

  If error.message is set, that means the user is trying to
  override the error message. This is how method-specific
  error overrides work, like this:

  z.string().min(5, { message: "TOO SMALL 🤬" })

  It is a best practice to return `error.message` if it is set.
  
  */
    if (error.message) return { message: error.message };

    /*
  This is where you override the various error codes
  */
    switch (error.code) {
      case z.ZodErrorCode.invalid_type:
        if (error.expected === 'string') {
          return { message: `This ain't a string!` };
        }
        break;
      case z.ZodErrorCode.custom_error:
        // produce a custom message using error.params
        // error.params won't be set unless you passed
        // a `params` arguments into a custom validator
        const params = error.params || {};
        if (params.myField) {
          return { message: `Bad input: ${params.myField}` };
        }
        break;
    }

    // fall back to default message!
    return { message: ctx.defaultError };
  };

  try {
    z.string().parse(12, { errorMap });
  } catch (err) {
    console.log(JSON.stringify(err.errors, null, 2));
  }
};

run();
