import * as z from '..';

test('array min', () => {
  z.array(z.string())
    .min(4)
    .parseAsync([])
    .catch(err => {
      expect(err.errors[0].message).toEqual('Should have at least 4 items');
    });
});

test('array max', () => {
  z.array(z.string())
    .max(2)
    .parseAsync(['asdf', 'asdf', 'asdf'])
    .catch(err => {
      expect(err.errors[0].message).toEqual('Should have at most 2 items');
    });
});

test('string min', () => {
  z.string()
    .min(4)
    .parseAsync('asd')
    .catch(err => {
      expect(err.errors[0].message).toEqual('Should be at least 4 characters');
    });
});

test('string max', () => {
  z.string()
    .max(4)
    .parseAsync('aasdfsdfsd')
    .catch(err => {
      expect(err.errors[0].message).toEqual('Should be at most 4 characters long');
    });
});

test('number min', () => {
  z.number()
    .min(3)
    .parseAsync(2)
    .catch(err => {
      expect(err.errors[0].message).toEqual('Value should be greater than or equal to 3');
    });
});

test('number max', () => {
  z.number()
    .max(3)
    .parseAsync(4)
    .catch(err => {
      expect(err.errors[0].message).toEqual('Value should be less than or equal to 3');
    });
});

test('number nonnegative', () => {
  z.number()
    .nonnegative()
    .parseAsync(-1)
    .catch(err => {
      expect(err.errors[0].message).toEqual('Value should be greater than or equal to 0');
    });
});

test('number nonpositive', () => {
  z.number()
    .nonpositive()
    .parseAsync(1)
    .catch(err => {
      expect(err.errors[0].message).toEqual('Value should be less than or equal to 0');
    });
});

test('number negative', () => {
  z.number()
    .negative()
    .parseAsync(1)
    .catch(err => {
      expect(err.errors[0].message).toEqual('Value should be less than 0');
    });
});

test('number positive', () => {
  z.number()
    .positive()
    .parseAsync(-1)
    .catch(err => {
      expect(err.errors[0].message).toEqual('Value should be greater than 0');
    });
});
