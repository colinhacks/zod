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
