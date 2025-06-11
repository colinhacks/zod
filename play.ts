import { z } from "zod/v4";

z;

// const schema = z.iso.datetime({ offset: true, local: true });
// console.dir(schema.parse("2023-10-01T12:00:00.132"), { depth: null });

const datetime = z.iso.datetime({ offset: true });

datetime.parse("2020-01-01T00:00:00+02:00"); // ✅
datetime.parse("2020-01-01T00:00:00.123+02:00"); // ✅ (millis optional)
datetime.parse("2020-01-01T00:00:00.123+0200"); // ✅ (millis optional)
datetime.parse("2020-01-01T00:00:00.123+02"); // ✅ (only offset hours)
datetime.parse("2020-01-01T00:00:00Z"); // ✅ (Z still supported)
