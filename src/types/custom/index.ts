import { ZodAny } from "../any";
import { CustomErrorParams, ZodType } from "../index";

export type CustomParams = CustomErrorParams & { fatal?: boolean };

export const custom = <T>(
  check?: (data: unknown) => any,
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
): ZodType<T> => {
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
        ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
      }
    });
  return ZodAny.create();
};
