import type * as core from "zod-core";
import type * as schemas from "./schemas.js";

export type ZodMiniErrorMap<T extends core.$ZodIssueBase = core.$ZodIssueBase> =
  core.$ZodErrorMap<T>;

export type Params<
  T extends schemas.ZodMiniType,
  AlsoOmit extends keyof T["_def"] = never,
> = Partial<Omit<T["_def"], "type" | "checks" | "error" | AlsoOmit>> & {
  error?: string | T["_def"]["error"] | undefined;
};

export interface RawCreateParams {
  error?: string | ZodMiniErrorMap<never> | undefined;
  description?: string | undefined;
  // [k: string]: unknown;
}

export type NormalizedCreateParams<
  T extends RawCreateParams = RawCreateParams,
> = Omit<T, "error"> & {
  error?: ZodMiniErrorMap<core.$ZodIssueBase> | undefined;
  // description?: string | undefined;
};

export function normalizeCreateParams<T extends RawCreateParams>(
  params?: T | undefined
): NormalizedCreateParams<T> {
  const processed: NormalizedCreateParams<T> = {} as any;
  if (!params) return processed;
  const { error: _error, description, ...rest } = params;
  if (_error)
    (processed as any).error =
      typeof _error === "string" ? () => _error : _error;
  if (description) processed.description = description;
  Object.assign(processed, rest);
  return processed;
}

export function splitChecksAndParams<T extends RawCreateParams>(
  _paramsOrChecks?: T | unknown[],
  _checks?: unknown[]
): {
  checks: core.$ZodCheck<any>[];
  params: T;
} {
  const params = (
    Array.isArray(_paramsOrChecks) ? {} : _paramsOrChecks ?? {}
  ) as T;
  const checks: any[] = Array.isArray(_paramsOrChecks)
    ? _paramsOrChecks
    : _checks ?? [];
  return {
    checks,
    params,
  };
}

export interface RawCheckParams {
  error?: string | core.$ZodErrorMap;
}
export interface NormalizedCheckParams {
  error?: core.$ZodErrorMap;
}

export function normalizeCheckParams(
  params?: string | RawCheckParams
): NormalizedCheckParams {
  if (typeof params === "string") return { error: params } as any;
  if (!params) return {} as any;
  return params as any;
}

export interface PrimitiveFactory<
  Params extends RawCreateParams,
  T extends schemas.ZodMiniType,
> {
  (): T;
  (params: Partial<Params>, checks?: core.$ZodCheck<core.output<T>>[]): T;
  (checks: core.$ZodCheck<core.output<T>>[]): T;
}

export const factory: <
  Params extends RawCreateParams,
  T extends schemas.ZodMiniType,
>(
  Cls: any,
  defaultParams: Omit<T["_def"], "checks" | "description" | "error">
) => PrimitiveFactory<Params, T> = (Cls, defaultParams) => {
  return <T extends schemas.ZodMiniType>(...args: any[]) => {
    const { checks, params } = splitChecksAndParams(...args);
    return new Cls({
      ...defaultParams,
      checks,
      ...normalizeCreateParams(params),
    }) as T;
  };
};

function inferNumber<T>(value: T): T {
  return value;
}
const result = inferNumber(0);
