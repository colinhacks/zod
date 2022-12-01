import * as z from "./src/index";

const schema = z.object({
  name: z.string().max(2).email().url(),
  age: z.number().min(18).max(19),
});

try {
  const result = await schema.parseAsync({ name: "John", age: 20 }, {
    fatalOnError: true
  });
  console.log('re', result)
} catch (err) {
  if(err instanceof z.ZodError)
    console.log(err.formErrors.fieldErrors);
  // console.log(err.formErrors, err.issues);
}