import * as z from "zod";

z;
const cidrv4 = z.string().cidrv4();
cidrv4.parse("192.168.0.0/24"); // ✅

const cidrv6 = z.string().cidrv6();
cidrv6.parse("2001:db8::/32"); // ✅
