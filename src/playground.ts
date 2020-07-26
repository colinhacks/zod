import * as z from '.';

const asyncString = z.string().refine(async _val => false);
asyncString.parse('asdf');

const run = async () => {
  // console.log(asyncString.parse('asdf'));
  const result = asyncString.parse('asdf');
  console.log(result);
};

run();
