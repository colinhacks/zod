import { z } from "zod/v4";

const User = z.string().optional();

console.dir(z.toJSONSchema(User), { depth: null });
// => {
//   type: 'object',
//   properties: { name: { type: 'string' }, friend: { '$ref': '#' } },
//   required: [ 'name', 'friend' ]
//   additionalProperties: false
// }

z.toJSONSchema(z.globalRegistry, {
  uri: (id) => `https://example.com/${id}.json`,
});
