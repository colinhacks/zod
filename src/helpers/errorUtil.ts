export namespace errorUtil {
  export type ErrMessage = string | { message?: string };
  export const errToObj = (message?: ErrMessage) => (typeof message === 'string' ? { message } : message || {});
}
