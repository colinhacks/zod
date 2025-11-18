import * as z from "zod";

z;

const mac = z.stringFormat(
  "mac",
  /^(([0-9A-F]{2}([-:])[0-9A-F]{2}(\3[0-9A-F]{2}){4})|([0-9a-f]{2}([-:])[0-9a-f]{2}(\6[0-9a-f]{2}){4}))$/
);

mac.parse("00:1A:2B:3C:4D:5E");
