import { ZodError } from '../ZodError';

test('error creation', () => {
  const err = ZodError.create([]);
  err.addError('', 'message 1');
  err.addError('path', 'message 1');
  err.addError(5, 'message 1');
  err.bubbleUp('upper');
  err.empty;

  err.merge(ZodError.create([]));
  err.mergeChild('adsf', ZodError.create([]));
  err.message;
  err.name;
});

test('error creation from object', () => {
  const error = ZodError.fromObject({test: 1});
  expect(error.errors[0].details).toEqual({test: 1});
});

test('error creation from string', () => {
  const error = ZodError.fromString('string');
  expect(error.errors[0].message).toEqual('string');
});
