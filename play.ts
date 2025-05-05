import * as z from "zod";

const test = z.object({}).or(z.array(z.object({})));
test.def.options[0]._zod.output;

type Test = z.output<typeof test>; // <— any
