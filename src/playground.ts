import * as z from '.';

const run = async () => {
  await z
    .union([z.string(), z.number().int()])
    .parseAsync(3.2)
    .then(console.log)
    .catch(_err => {
      console.log('error! oh no!');
    });
};

run();
