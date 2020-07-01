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
