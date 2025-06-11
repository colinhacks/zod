import { z } from "zod/v4";

z;

// const schema = z.iso.datetime({ offset: true, local: true });
// console.dir(schema.parse("2023-10-01T12:00:00.132"), { depth: null });

const datetime = z.iso.datetime({ local: true, offset: true });
// /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|(?:[+-]\d{2}(?::?\d{2})?))|(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?)$/

console.dir(datetime._zod.def.pattern, { depth: null });
datetime.parse("2020-01-01T00:00:00Z");
datetime.parse("2020-01-01T00:00");
datetime.parse("2020-01-01T00:00:12Z");

// datetime.parse("2020-01-01T00:77");
