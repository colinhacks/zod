import { z } from "zod";

z;

// import { z } from "zod";
const BrandedSchema = z.string().brand<"brand">();
const WrappedSchema = z.object({ key: BrandedSchema });

type bso = typeof BrandedSchema._output;
type basdfasdfso = typeof BrandedSchema._zod.output;
type wso = (typeof WrappedSchema._output)["key"];
type bso2 = z.output<typeof BrandedSchema>;
type wso2 = z.output<typeof WrappedSchema>["key"];

// --- Runtime playground below ---
function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

// Simple jsonString examples
section("jsonString basics");
const jsonSchema = z.jsonString();
console.log("Valid JSON:", jsonSchema.parse('{"name": "Alice", "age": 30}'));
console.log("Number JSON:", jsonSchema.parse("42"));
console.log("Array JSON:", jsonSchema.parse("[1, 2, 3]"));

try {
  jsonSchema.parse("invalid json");
} catch (err) {
  console.log("Invalid JSON error:", err instanceof z.ZodError ? err.issues[0].code : err);
}

// Basic object with coercion and validations
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  age: z.coerce.number().int().min(0).optional(),
  email: z.string().email().optional(),
});

const goodUserInput = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Ada",
  age: "33",
  email: "ada@example.com",
};
const badUserInput = {
  id: "123", // not a uuid
  name: "", // too short
  age: -5, // below min
  email: "not-an-email",
};

section("parse (ok)");
console.log(UserSchema.parse(goodUserInput));

section("parse (throws on error)");
try {
  UserSchema.parse(badUserInput);
} catch (err: unknown) {
  if (err instanceof z.ZodError) {
    console.log(err.issues);
  } else {
    console.error(err);
  }
}

section("safeParse (success/failure object)");
console.log(UserSchema.safeParse(badUserInput));

// Transform example
const PercentString = z
  .string()
  .regex(/^\d+%$/)
  .transform((value: string) => Number(value.slice(0, -1)));
section("transform");
console.log(PercentString.parse("42%")); // 42

// Discriminated union example
const Shape = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("circle"), radius: z.number().positive() }),
  z.object({ kind: z.literal("square"), size: z.number().positive() }),
]);
section("discriminated union");
console.log(Shape.parse({ kind: "circle", radius: 2 }));

// Async refinement example
const EvenNumberAsync = z.number().refine(
  async (n: number) => {
    await new Promise((r) => setTimeout(r, 10));
    return n % 2 === 0;
  },
  { message: "Must be even" }
);
section("async refinement");
EvenNumberAsync.parseAsync(4)
  .then((v: number) => console.log("async ok:", v))
  .catch((e: unknown) => console.log("async error:", e instanceof z.ZodError ? e.issues : e));
