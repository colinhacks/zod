import * as z from "../index";

function checkErrors(a: z.ZodTypeAny, bad: any) {
  let expected;
  try {
    a.parse(bad);
  } catch (error) {
    expected = error.formErrors;
  }
  try {
    a.optional().parse(bad);
  } catch (error) {
    expect(error.formErrors).toStrictEqual(expected);
  }
}

it("Should have error messages appropriate for the underlying type", () => {
  checkErrors(z.string().min(2), 1);
  z.string().min(2).optional().parse(undefined);
  checkErrors(z.number().min(2), 1);
  z.number().min(2).optional().parse(undefined);
  checkErrors(z.boolean(), "");
  z.boolean().optional().parse(undefined);
  checkErrors(z.undefined(), null);
  z.undefined().optional().parse(undefined);
  checkErrors(z.null(), {});
  z.null().optional().parse(undefined);
  checkErrors(z.object({}), 1);
  z.object({}).optional().parse(undefined);
  checkErrors(z.tuple([]), 1);
  z.tuple([]).optional().parse(undefined);
  checkErrors(z.unknown(), 1);
  z.unknown().optional().parse(undefined);
});
