import * as z from "zod";
// import * as z from "zod";

z;

const Cat = z.object({ name: z.string() }).brand<"Cat">();
type Cat = z.infer<typeof Cat>;

z.templateLiteral(["hi there"]);
// `hi there`

z.templateLiteral(["email: ", z.string()]);
// `email: ${string}`

z.templateLiteral(["high", z.literal(5)]);
// `high5`

z.templateLiteral([z.nullable(z.literal("grassy"))]);
// `grassy` | `null`

z.templateLiteral([z.number(), z.enum(["px", "em", "rem"])]);
// `${number}px` | `${number}em` | `${number}rem`
