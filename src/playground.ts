import { z } from ".";

const run = async () => {
  const promiseSchema = z.promise(z.number());
  console.log(`test("promise async parse bad"`);
  const badData = Promise.resolve("XXX");
  const badResult = await promiseSchema.safeParseAsync(badData);
  console.log(badResult);
};

run();

export {};
