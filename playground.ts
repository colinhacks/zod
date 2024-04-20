import { z } from "./src";

z;

/* eslint-env mocha */

// const { z, ZodError } = require('zod')

// describe('zod', function () {
// it('cannot deal with circular data structures', function () {
const AnObjectSchema = z.object({ someLiteralProperty: z.literal(1) });

const cicrularObject: any = {
  aProperty: "a property",
  anotherProperty: 137,
  anObjectProperty: { anObjectPropertyProperty: "an object property property" },
  anArrayProperty: [
    { anArrayObjectPropertyProperty: "an object property property" },
  ],
};
cicrularObject.anObjectProperty.cicrularObject = cicrularObject;
cicrularObject.anArrayProperty.push(cicrularObject.anObjectProperty);
const violatingObject = { someLiteralProperty: cicrularObject };

const { success, error } = AnObjectSchema.safeParse(violatingObject);

console.log({ success, error });
// })
// })
