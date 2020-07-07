import * as z from '..';
import { ZodError, ZodErrorCode } from '../ZodError';
import { ParsedType } from '../parser';

test('error creation', () => {
  const err1 = ZodError.create([]);
  err1.addError({
    code: ZodErrorCode.invalid_type,
    expected: ParsedType.object,
    received: ParsedType.string,
    path: [],
    message: '',
  });
  err1.isEmpty;

  const err2 = ZodError.create(err1.errors);
  const err3 = new ZodError([]);
  err3.addErrors(err1.errors);
  err3.addError(err1.errors[0]);
  err1.message;
  err2.message;
  err3.message;
});

test('custom errormap', () => {
  const errorMap: z.ErrorMap = (error, ctx) => {
    if (error.code === ZodErrorCode.invalid_type) {
      if (error.expected === 'string') {
        return "This ain't no string!";
      }
    }
    if (error.code === ZodErrorCode.custom_error) {
      return JSON.stringify(error.params, null, 2);
    }
    return ctx.defaultError;
  };
  errorMap;

  z.string()
    .refinement({
      check: val => val.length > 12,
      // params: { test: 15 },
      message: 'Override!',
    })
    .parse('asdf', { errorMap });
});
