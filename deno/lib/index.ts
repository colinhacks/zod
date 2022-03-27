import * as mod from "./external.ts";
export * from "./external.ts";
export { mod as z };
export default mod;

export function makeZod<T>(arg: T): T & typeof mod {
  return {
    ...mod,
    ...arg,
  };
}
