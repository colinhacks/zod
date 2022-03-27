import * as mod from "./external";
export * from "./external";
export { mod as z };
export default mod;

export function makeZod<T>(arg: T): T & typeof mod {
  return {
    ...mod,
    ...arg,
  };
}
