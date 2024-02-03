export namespace errorUtil {
  export type ErrMessage = string | { message?: string };
  export const errToObj = (message?: ErrMessage) =>
    typeof message === "string" ? { message } : message || {};
  export const toString = (message?: ErrMessage): string | undefined =>
    typeof message === "string" ? message : message?.message;

  export type ErrMessageCallback = (value: string) => string;
}
