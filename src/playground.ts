import * as z from '.';

const run = async () => {
  const apiString = z.string();
  z.object({
    columns: z.record(z.string()),
    primaryKey: z.array(apiString.nonempty()).nonempty(),
  })._refinement((data, ctx) => {
    const invalidPks = data.primaryKey.filter(
      pk => !Object.keys(data.columns).includes(pk),
    );
    if (invalidPks.length) {
      ctx.addError({
        code: z.ZodIssueCode.custom_error,
        message: `Invalid PKs: ${invalidPks.join(', ')}`,
      });
    }
  });
};

run();
