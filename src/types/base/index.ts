import { ZodType } from "./type";
import { ZodTypeAny } from "./type-any";

export { ZodType } from "./type";
export type ZodRawShape = { [k: string]: ZodTypeAny };

// type Check<T> = {
//   check: (arg: T) => any;
//   path?: (string | number)[];
//   // message?: string;
//   // params?: {[k:string]:any}
// } & util.Omit<CustomError, 'code' | 'path'>;

// type Check<T> = {
//   check: (arg: T) => any;
//   refinementError: (arg: T) => CustomErrorParams;
// };

export type TypeOf<T extends ZodType<any>> = T["_output"];
export type input<T extends ZodType<any>> = T["_input"];
export type output<T extends ZodType<any>> = T["_output"];
export type infer<T extends ZodType<any>> = T["_output"];
