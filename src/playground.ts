import { z } from ".";
import { ZodError } from "./ZodError";

export type ZodErrorObject<T> = T extends [any, ...any]
  ? { [K in keyof T]?: ZodErrorObject<T[K]> } & { _errors: string[] }
  : T extends any[]
  ? ZodErrorObject<T[number]>[] & { _errors: string[] }
  : T extends object
  ? { [K in keyof T]?: ZodErrorObject<T[K]> } & { _errors: string[] }
  : { _errors: string[] };

// type f0 = ZodErrorObject<{ outer: { inner: string[] } }>;
// type f1 = ZodErrorObject<string>;
// type f2 = ZodErrorObject<[string, number]>;
// const t0: f0 = "asdf" as any;
// const t1: f1 = "asdf" as any;
// const t2: f2 = "asdf" as any;

// {
//     "code": "custom",
//     "message": "Invalid value.",
//     "path": [
//       "inner",
//       "name",
//       0
//     ]
//   },
// obj: {}
// curr: {}
// el: inner
// set curr[el] = {}
const formatError = <T>(_error: ZodError): ZodErrorObject<T> => {
  const fieldErrors: ZodErrorObject<T> = {} as any;
  const processError = (error: z.ZodError) => {
    for (const issue of error.issues) {
      console.log(`\n######`);
      console.log(issue);

      if (issue.code === "invalid_union") {
        issue.unionErrors.map(processError);
      } else if (issue.code === "invalid_return_type") {
        processError(issue.returnTypeError);
      } else if (issue.code === "invalid_arguments") {
        processError(issue.argumentsError);
      } else {
        let curr: any = fieldErrors;
        let i = 0;
        while (i < issue.path.length) {
          const el = issue.path[i];
          const terminal = i === issue.path.length - 1;
          console.log(`\n# el: ${el}`);
          console.log(`curr: ${JSON.stringify(curr, null, 2)}`);
          console.log(`terminal: ${terminal}`);

          if (!terminal) {
            if (typeof el === "string") {
              curr[el] = curr[el] || { _errors: [] };
            } else if (typeof el === "number") {
              const errorArray: any = [];
              errorArray._errors = [];
              curr[el] = curr[el] || errorArray;
            }
          } else {
            curr[el] = curr[el] || { _errors: [] };
            curr[el]._errors.push(issue.message);
          }

          curr = curr[el];
          i++;
        }
      }
    }

    console.log(`CURRENT fieldErrors`);
    console.log(JSON.stringify(fieldErrors, null, 2));
  };
  processError(_error);
  return fieldErrors;
};

const formikValidateWithZod = <T extends z.Schema<any>>(
  validationSchema: T
) => <F extends z.input<T>>(values: F): ZodErrorObject<F> => {
  const result = validationSchema.safeParse(values);

  if (result.success) {
    return {} as any;
  } else {
    // console.log(result.error);
    return formatError(result.error) as any;
    // const fieldErrors: ZodErrorObject<F> = {} as any;

    // const processError = (e: z.ZodError) => {
    //   for (const error of e.errors) {
    //     console.log(error);
    //     if (error.code === "invalid_union") {
    //       error.unionErrors.map(processError);
    //     } else if (error.code === "invalid_return_type") {
    //       processError(error.returnTypeError);
    //     } else if (error.code === "invalid_arguments") {
    //       processError(error.argumentsError);
    //     } else {
    //       console.log(`Issue: `, e.message);
    //       console.log(`Path: `, error.path);
    //       console.log(`Errors: ${JSON.stringify(fieldErrors, null, 2)}`);
    //       // const path = error.path.map((x) => x.toString());
    //       const currentErrorAtPath = util.get(fieldErrors, error.path);
    //       console.log(
    //         `Current error at path: ${JSON.stringify(
    //           currentErrorAtPath,
    //           null,
    //           2
    //         )}`
    //       );
    //       util.set(
    //         fieldErrors,
    //         error.path,
    //         currentErrorAtPath // if error already exists, append as new line
    //           ? [currentErrorAtPath, error.message]
    //           : [error.message]
    //       );
    //     }
    //   }
    // };
    // processError(result.error);
    // return fieldErrors;
  }
};

const run = async () => {
  const schema = z
    .object({
      inner: z.object({
        name: z
          .string()
          .refine((val) => val.length > 5)
          .array()
          .refine((val) => val.length > 5),
      }),
      password: z.string(),
      confirm: z.string(),
    })
    .refine((val) => val.confirm === val.password, { path: ["confirm"] });
  const error = formikValidateWithZod(schema)({
    inner: { name: ["aasd", "asdfasdfasfd", "aasd"] },
    password: "peanuts",
    confirm: "Peanuts",
  });

  const name = error.inner?.name;
  type asdf = typeof name;
  const asdf: asdf = "asdf" as any;

  console.log("##############");
  console.log("##############");
  console.log(JSON.stringify(error, null, 2));
  // console.log(error._errors);
  // console.log(error.inner);
  // console.log(error.inner?.name?._errors);
  // console.log(error.inner?.name?.[0]._errors);
  // console.log(error.confirm?._errors);
  // console.log(error.password?._errors);
};

run();

export {};
