import { z } from "./src";

z;

const time = z.string().time();
time.parse("00:00:00");
time.parse("09:52:31");
time.parse("23:59:59.9999999");
