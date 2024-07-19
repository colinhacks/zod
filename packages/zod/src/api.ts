import type { errorUtil } from "./helpers/index.js";

import {
  type CustomErrorParams,
  type RawCreateParams,
  ZodAny,
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodEnum,
  ZodFile,
  ZodFunction,
  ZodIntersection,
  ZodLazy,
  ZodLiteral,
  ZodMap,
  ZodNaN,
  ZodNativeEnum,
  ZodNever,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodPipeline,
  ZodPromise,
  ZodRecord,
  ZodSet,
  ZodString,
  ZodSymbol,
  ZodTemplateLiteral,
  ZodTuple,
  type ZodType,
  ZodUndefined,
  ZodUnion,
  ZodUnknown,
  ZodVoid,
} from "./classes.js";
import type { Primitive } from "./helpers/typeAliases.js";

export { ZodParsedType } from "./helpers/util.js";

// requires TS 4.4+

abstract class Class {
  // biome-ignore lint/complexity/noUselessConstructor:
  constructor(..._: any[]) {}
}

function instanceOfType<T extends typeof Class>(
  cls: T,
  params: CustomParams = {
    message: `Input not instance of ${cls.name}`,
  }
): ZodCustom<InstanceType<T>> {
  return custom((data) => data instanceof cls, params);
}

const stringType: typeof ZodString.create = (...args) =>
  ZodString.create(...args);
const numberType: typeof ZodNumber.create = (...args) =>
  ZodNumber.create(...args);
const nanType: typeof ZodNaN.create = (...args) => ZodNaN.create(...args);
const bigIntType: typeof ZodBigInt.create = (...args) =>
  ZodBigInt.create(...args);
const booleanType: typeof ZodBoolean.create = (...args) =>
  ZodBoolean.create(...args);
const dateType: typeof ZodDate.create = (...args) => ZodDate.create(...args);
const fileType: typeof ZodFile.create = (...args) => ZodFile.create(...args);
const symbolType: typeof ZodSymbol.create = (...args) =>
  ZodSymbol.create(...args);
const undefinedType: typeof ZodUndefined.create = (...args) =>
  ZodUndefined.create(...args);
const nullType: typeof ZodNull.create = (...args) => ZodNull.create(...args);
const anyType: typeof ZodAny.create = (...args) => ZodAny.create(...args);
const unknownType: typeof ZodUnknown.create = (...args) =>
  ZodUnknown.create(...args);
const neverType: typeof ZodNever.create = (...args) => ZodNever.create(...args);
const voidType: typeof ZodVoid.create = (...args) => ZodVoid.create(...args);
const arrayType: typeof ZodArray.create = (...args) => ZodArray.create(...args);
const objectType: typeof ZodObject.create = (...args) =>
  ZodObject.create(...args);
const strictObjectType: typeof ZodObject.strictCreate = (...args) =>
  ZodObject.strictCreate(...args);
const unionType: typeof ZodUnion.create = (...args) => ZodUnion.create(...args);
const discriminatedUnionType: typeof ZodDiscriminatedUnion.create = (...args) =>
  ZodDiscriminatedUnion.create(...args);
const intersectionType: typeof ZodIntersection.create = (...args) =>
  ZodIntersection.create(...args);
const tupleType: typeof ZodTuple.create = (...args) => ZodTuple.create(...args);
const recordType: typeof ZodRecord.create = (...args: [any]) =>
  ZodRecord.create(...args);
const mapType: typeof ZodMap.create = (...args) => ZodMap.create(...args);
const setType: typeof ZodSet.create = (...args) => ZodSet.create(...args);
const functionType: typeof ZodFunction.create = (...args: [any?]) =>
  ZodFunction.create(...args);
const lazyType: typeof ZodLazy.create = (...args) => ZodLazy.create(...args);
const enumType: typeof ZodEnum.create = (...args: [any]) =>
  ZodEnum.create(...args);
const nativeEnumType: typeof ZodNativeEnum.create = (...args) =>
  ZodNativeEnum.create(...args);
const promiseType: typeof ZodPromise.create = (...args) =>
  ZodPromise.create(...args);
const effectsType: typeof ZodEffects.create = (...args) =>
  ZodEffects.create(...args);
const optionalType: typeof ZodOptional.create = (...args) =>
  ZodOptional.create(...args);
const nullableType: typeof ZodNullable.create = (...args) =>
  ZodNullable.create(...args);

const preprocessType: typeof ZodEffects.createWithPreprocess = (...args) =>
  ZodEffects.createWithPreprocess(...args);
const pipelineType: typeof ZodPipeline.create = (...args) =>
  ZodPipeline.create(...args);

interface Literal {
  <T extends Primitive>(
    value: T,
    params?: RawCreateParams & Exclude<errorUtil.ErrMessage, string>
  ): ZodLiteral<T>;

  template: typeof ZodTemplateLiteral.create;
}
const _literalType: typeof ZodLiteral.create = (...args) =>
  ZodLiteral.create(...args);
Object.defineProperty(_literalType, "template", {
  value: ZodTemplateLiteral.create,
});
const literalType = _literalType as Literal;

const ostring: () => ZodOptional<ZodString> = () => stringType().optional();
const onumber: () => ZodOptional<ZodNumber> = () => numberType().optional();
const oboolean: () => ZodOptional<ZodBoolean> = () => booleanType().optional();

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      z.custom      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
type CustomParams = CustomErrorParams & { fatal?: boolean };
export type ZodCustom<T> = ZodType<T, T>;
export function custom<T>(
  check?: (data: any) => any,
  params: string | CustomParams | ((input: any) => CustomParams) = {},
  /**
   * @deprecated
   *
   * Pass `fatal` into the params object instead:
   *
   * ```ts
   * z.string().custom((val) => val.length > 5, { fatal: false })
   * ```
   *
   */

  fatal?: boolean
): ZodCustom<T> {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      if (!check(data)) {
        const p =
          typeof params === "function"
            ? params(data)
            : typeof params === "string"
              ? { message: params }
              : params;
        const _fatal = p.fatal ?? fatal ?? true;
        const p2 = typeof p === "string" ? { message: p } : p;
        ctx.addIssue({ input: data, code: "custom", ...p2, fatal: _fatal });
      }
    });
  return ZodAny.create();
}

const lateObject: typeof ZodObject.lazycreate = (...args: [any]) =>
  ZodObject.lazycreate(...args);
export const late: { object: typeof lateObject } = {
  object: lateObject,
};

export * as coerce from "./coerce.js";

export {
  anyType as any,
  arrayType as array,
  bigIntType as bigint,
  booleanType as boolean,
  dateType as date,
  discriminatedUnionType as discriminatedUnion,
  effectsType as effect,
  enumType as enum,
  fileType as file,
  functionType as function,
  instanceOfType as instanceof,
  intersectionType as intersection,
  lazyType as lazy,
  literalType as literal,
  mapType as map,
  nanType as nan,
  nativeEnumType as nativeEnum,
  neverType as never,
  nullType as null,
  nullableType as nullable,
  numberType as number,
  objectType as object,
  oboolean,
  onumber,
  optionalType as optional,
  ostring,
  pipelineType as pipeline,
  preprocessType as preprocess,
  promiseType as promise,
  recordType as record,
  setType as set,
  strictObjectType as strictObject,
  stringType as string,
  symbolType as symbol,
  effectsType as transformer,
  tupleType as tuple,
  undefinedType as undefined,
  unionType as union,
  unknownType as unknown,
  voidType as void,
};
