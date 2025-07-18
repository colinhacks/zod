import * as z from "zod";

const stringToNumber = z.pipe(
  z.string(),
  z.transform({
    to: (value: string) => Number.parseInt(value, 10),
    from: (value: number) => value.toString(),
  }),
  z.number()
);

const numberWithMinCheck = z.number().check(z.minimum(10));
const pipeWithChecks = z.pipe(stringToNumber, numberWithMinCheck);

// With the new pipe-centric API, unparse should work correctly
console.log(JSON.stringify(pipeWithChecks.unparse(15)));
