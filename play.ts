import * as z from "zod";

z.stringFormat("my-format", /myregex/g).parse("invalid input!");
