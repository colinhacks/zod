export namespace errorUtil {
  export type ErrMessage = string | { message?: string | undefined; code?: string | undefined };
  export const errToObj = (message?: ErrMessage): { message?: string | undefined; code?: string | undefined } =>
    typeof message === "string" ? { message } : message || {};
  // biome-ignore lint:
  export const toString = (message?: ErrMessage): string | undefined =>
    typeof message === "string" ? message : message?.message;
}
