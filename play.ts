import { z } from "zod/v4";

const datetime = z.iso.datetime({ offset: true });
datetime.parse("2020-01-01T00:00:00.123+02");
