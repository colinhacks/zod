import z from "zod";

/*
ZodFunctionInternals is a problem
InferOuterFunctionType is a problem. It calls core.output on Results, which results in boolean
ZodPromiseInternals<TUnwrapped extends ZodType> passes core.output<TUnwrapped> as its output 
*/

const Func = z.function({
  input: z.any(),
  output: z.promise(z.boolean()),
});

const f = Func.parse(async () => true);

type ZFZod = (typeof Func)["_zod"];
type ZFOutput = ZFZod["output"];

type Func = z.infer<typeof Func>;

type Success = Func extends (args: any) => Promise<boolean> ? true : false;

const promiseBool = z.promise(z.boolean());
type ZFPromiseBool = typeof promiseBool;
type ZFPromiseBoolOutput = ZFPromiseBool["_zod"]["output"];