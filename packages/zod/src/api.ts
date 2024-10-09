import * as core from "zod-core";
import type * as err from "zod-core/error";
import * as schemas from "./schemas.js";

export interface RawCreateParams {
  error?: string | err.$ZodErrorMap;
  /** @deprecated The `errorMap` parameter has been renamed to just `error`.
   *
   * @example ```ts
   * z.string().create({ error: myErrorMap });
   * ```
   */
  errorMap?: err.$ZodErrorMap;
  /** @deprecated The `invalid_type_error` parameter has been deprecated and will be removed in a future version. Use the `error` field instead.
   *
   * @example ```ts
   * z.string({
   *   error: 'Bad input'
   * });
   * ```
   */
  invalid_type_error?: string;
  /**
   * @deprecated The `required_error` parameter has been deprecated and will be removed in a future version. Use the `error` field instead.
   * @example ```ts
   * z.string({
   *  error: (issue) => issue.input === undefined ? 'Field is required!' : undefined
   * });
   */
  required_error?: string;
  description?: string;
}

export type ProcessedCreateParams = {
  error?: err.$ZodErrorMap | undefined;
  description?: string | undefined;
};

export function processParams(params: RawCreateParams | undefined): ProcessedCreateParams {
  if (!params) return {};
  const { error: _error, invalid_type_error, required_error, description, ...rest } = params;
  const error = typeof _error === "string" ? () => _error : _error;
  if (error && params.errorMap) {
    throw new Error(`Do not specify "message" and "errorMap" together`);
  }

  const _customMap: err.$ZodErrorMap | undefined = error ?? params.errorMap;
  if (_customMap && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (_customMap) return { error: _customMap, description, ...rest };

  const customMap: err.$ZodErrorMap = (iss) => {
    if (iss.code !== "invalid_type") return;
    if (params.required_error && typeof iss.input === "undefined") return params.required_error;
    return invalid_type_error;
  };
  return { error: customMap, description, ...rest };
}

type PrimitiveParams = ((...args: any[]) => any) | Record<string, any>; // | string;
function processChecksAndParams(_paramsOrChecks?: any[] | PrimitiveParams, _params?: PrimitiveParams) {
  const params: RawCreateParams = {};
  let raw: PrimitiveParams;
  if (Array.isArray(_paramsOrChecks)) {
    params.checks = _paramsOrChecks;
    raw = _params as any;
  } else {
    raw = _paramsOrChecks as any;
  }

  if (typeof raw === "string") {
    params.error = () => raw;
  } else if (typeof raw === "function") {
    params.error = raw as any;
  } else if (core.isPlainObject(params)) {
    Object.assign(params, raw);
  } else {
    throw new Error("Invalid params");
  }

  // const params = Array.isArray(_paramsOrChecks) ? _params : _paramsOrChecks;
  // const checks = Array.isArray(_paramsOrChecks) ? _paramsOrChecks : [];
  return {
    checks,
    ...processCreateParams(params),
  };
}

/* string */
export function string(params?: ZodTypeParams): core.ZodString;

////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      z.custom      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////

/* custom */
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
          typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
        const _fatal = p.fatal ?? fatal ?? true;
        const p2 = typeof p === "string" ? { message: p } : p;
        ctx.addIssue({
          input: data,
          code: core.ZodIssueCode.custom,
          ...p2,
          fatal: _fatal,
        });
      }
    });
  return ZodAny.create();
}

/* lateObject */
const lateObject: typeof ZodObject.lazycreate = (...args: [any]) => ZodObject.lazycreate(...args);
export const late: { object: typeof lateObject } = {
  object: lateObject,
};

/* instanceof */
abstract class Class {
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
export { instanceOfType as instanceof };

/* lateObject */
export * as coerce from "./coerce.js";
/*
  - strictObject
  - lateObject
  - ostring
  - onumber
  - oboolean
  - instanceof
  - late
  - lazy
  - custom
*/

/** @deprecated Use z.configure() instead. */
export function setErrorMap(map: err.$ZodErrorMap): void {
  core.getConfig().error = map;
}

/** @deprecated Use z.getConfig().error instead. */
export function getErrorMap(): err.$ZodErrorMap {
  return core.getConfig().error;
}
