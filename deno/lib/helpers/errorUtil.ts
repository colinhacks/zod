export type ErrMessage = string | { message?: string };
export const errToObj = (message?: ErrMessage) =>
  typeof message === "string" ? { message } : message || {};

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export const toString = (message?: ErrMessage): string | undefined =>
  typeof message === "string" ? message : message?.message;
