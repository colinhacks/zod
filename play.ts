import * as z from "zod";

z.templateLiteral([z.string().min(5), "@", z.string().min(5)]).parse("asdf@asdf");
