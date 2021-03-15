import * as z from "./index.ts";
// import { PseudoPromise } from "./PseudoPromise";

// const test = z.object({
//   key: z.literal("asdf"),
//   name: z.string().optional(),
//   age: z.number().nullable(),
//   tuple: z.tuple([z.number(), z.string()]),
//   set: z.set(z.boolean()),
//   union: z.union([z.string(), z.number(), z.boolean()]),
//   enum: z.enum(["Colin", "Ryan"]),
//   record: z.record(z.object({ name: z.string() })),
//   transformer: z.string().transform(async (val) => val.toUpperCase()),
// });
// test;

const run = async () => {
  // console.log(
  //   await test
  //     .spa({
  //       key: "asdf",
  //       name: undefined,
  //       age: null,
  //       tuple: [124, "false"],
  //       set: new Set().add(true).add(false),
  //       union: "asdf",
  //       enum: "Ryan",
  //       record: { asdf: { name: "Colin" } },
  //       transformer: "colin",
  //     })
  //     .catch(console.log)
  // );

  // const myFunc = z
  //   .function()
  //   .args(z.string())
  //   .returns(z.number())
  //   .implement((arg) => {
  //     return arg as any;
  //   });
  // console.log(myFunc("asdf"));
  // const testTuple = z.tuple([
  //   z.object({ name: z.literal("Rudy") }),
  //   z.string(),
  //   z.array(z.literal("blue")),
  // ]);
  // console.log(
  //   await testTuple.spa([{ name: "Rudy2" }, 123, ["blue", "red"]] as any)
  // );
  // console.log(
  //   await testTuple.spa([{ name: "Rudy" }, "123", ["blue", "blue"]] as any)
  // );
  // const stringSet = z.set(z.string());
  // const result = stringSet.safeParse(new Set([1, 2] as any[]) as Set<any>);
  // console.log(result);
  // const Schema = z.union([
  //   z.object({
  //     val: z.literal("a"),
  //     a: z.ostring(),
  //   }),
  //   z.object({
  //     val: z.literal("b"),
  //     b: z.onumber(),
  //   }),
  // ]);

  // console.log(
  //   Schema.parse({
  //     val: "a",
  //     a: 123,
  //   })
  // );

  // can either be a string or a positive number
  // const schema = z.union([
  //   z.string(),
  //   z.number().refine((x) => x > 0, { message: "Number must be positive" }),
  // ]);

  // schema.parse(-1);

  // const promSchema = z.promise(
  //   z.object({
  //     name: z.string(),
  //     age: z.number(),
  //   })
  // );

  // const failPromise = promSchema
  //   .parse(Promise.resolve({ name: "Bobby", age: "10" }))
  //   .catch((err) => {
  //     console.log(`CAUGHT ERROR`);
  //     console.log(err);
  //   });
  // console.log(await failPromise);

  // const promiseSchema = z.promise(z.number());
  // const goodData = Promise.resolve(123);
  // const badData = Promise.resolve("XXX");
  // const goodResult = await promiseSchema.safeParseAsync(goodData);
  // console.log(goodResult);
  // const badResult = await promiseSchema.safeParseAsync(badData);
  // console.log(badResult);

  // const crazySchema = z.object({
  //   numProm: z.promise(z.number()),
  // });
  // const prom = crazySchema.spa({
  //   numProm: Promise.resolve(12),
  // });
  // console.log(prom);
  // console.log(await prom);
  // const promSchema = z.promise(z.any());

  // const data = Promise.resolve({ name: "Bobby", age: "10" });

  // console.log(`TESTS`);
  // console.log(`parse`);
  // console.log(promSchema.parse(data));
  // console.log(`safeParse`);
  // console.log(promSchema.safeParse(data));
  // console.log(`parseAsync`);
  // console.log(promSchema.parseAsync(data));
  // console.log(`safeParseAsync`);
  // console.log(await promSchema.safeParseAsync(data));

  // const test = promSchema.parse({
  //   then() {
  //     return this;
  //   },
  //   catch() {
  //     return this;
  //   },
  // });
  // console.log(test);

  // const fakeProm = {
  //   then() {
  //     return this;
  //   },
  //   catch() {
  //     return this;
  //   },
  // };

  // console.log(fakeProm.then());
  // console.log(fakeProm.then().then());

  // if (failPromise.success) {
  //   console.log(`SUCCESS`);
  //   console.log(
  //     await failPromise.data.catch((err) => {
  //       console.log(`CAUGHT`);
  //       console.log(err);
  //     })
  //   );
  // } else {
  //   console.log(`FAIL`);
  // }
  // console.log(await failPromise);
  //
  // const asdf = await (("asdf" as any) as Promise<Promise<string>>);

  // const nested = z.object({
  //   name: z.string(),
  //   age: z.number(),
  //   outer: z.object({
  //     inner: z.string(),
  //   }),
  // });
  // console.log(nested.shape);

  // const deep = nested.deepPartial();
  // // console.log(deep.shape);
  // console.log(`NAME`);
  // console.log(deep.shape.name);
  // console.log(`OUTER`);
  // console.log(deep.shape.outer);
  // console.log(deep.shape.name instanceof z.ZodOptional);
  // console.log(deep.shape.outer instanceof z.ZodOptional);
  // console.log(deep.shape.outer._def.innerType instanceof z.ZodObject);
  // console.log(
  //   deep.shape.outer._def.innerType.shape.inner instanceof z.ZodOptional
  // );
  // console.log(
  //   deep.shape.outer._def.innerType.shape.inner._def.innerType instanceof
  //     z.ZodString
  // );
  // const checker = z
  //   .function(z.tuple([z.string()]), z.boolean())
  //   .implement((arg) => {
  //     return arg.length as any;
  //   });
  // try {
  //   checker(12 as any);
  // } catch (err) {
  //   console.log(err);
  //   const zerr: z.ZodError = err;
  //   const first = zerr.issues[0];
  //   if (first.code !== z.ZodIssueCode.invalid_arguments) throw new Error();

  //   // expect(first.argumentsError).toBeInstanceOf(z.ZodError);
  // }

  // const prom = new PseudoPromise()
  //   .then(() => {
  //     throw new Error();
  //   })
  //   .catch(() => {
  //     return "hello";
  //   });
  // console.log(prom.getValueSync());
  const base = z.object({
    hello: z.string().refine((x) => x && x.length > 0),
    foo: z.string().refine((x) => x && x.length > 0),
  });
  const testval = { hello: "", foo: "" };
  const result1 = base.safeParse(testval);
  console.log(`RESULT 1`);
  console.log(result1);
  // const result2 = await base.safeParseAsync(testval);
  // console.log(`RESULT 2`);
  // console.log(result2);

  // const prom = PseudoPromise.resolve(5).all(val => {
  //   return [PseudoPromise.resolve(true), PseudoPromise.resolve(val)];
  // })
  // const prom2 = PseudoPromise.all([
  //   PseudoPromise.resolve(true),
  //   PseudoPromise.resolve(5),
  // ]);

  // const r1 = result1;
  // await result2.then((r2) => {
  //   if (r1.success === false && r2.success === false)
  //     expect(r1.error.issues.length).toBe(r2.error.issues.length); // <--- r1 has length 2, r2 has length 1
  // });
};

run();
