import * as z from '../index';
import { util } from '../helpers/util';

test('instanceof', async () => {
  class Test {}
  class Subtest extends Test {}

  const TestSchema = z.instanceof(Test);
  const SubtestSchema = z.instanceof(Subtest);

  TestSchema.parse(new Test());
  TestSchema.parse(new Subtest());
  SubtestSchema.parse(new Subtest());

  expect.assertions(4);
  expect(() => SubtestSchema.parse(new Test())).toThrow();
  expect(() => TestSchema.parse(12)).toThrow();

  await TestSchema.parseAsync(12).catch(err => {
    expect(err.errors[0].message).toEqual('Input not instance of Test');
  });
  await SubtestSchema.parseAsync(12).catch(err => {
    expect(err.errors[0].message).toEqual('Input not instance of Subtest');
  });

  const f1: util.AssertEqual<Test, z.infer<typeof TestSchema>> = true;
  f1;
});
