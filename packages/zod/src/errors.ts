import type { ZodErrorMap } from "./ZodError.js";
import defaultErrorMap from "./locales/en.js";

let overrideErrorMap = defaultErrorMap;
export { defaultErrorMap };

export function setErrorMap(map: ZodErrorMap): void {
  overrideErrorMap = map;
}

export function getErrorMap(): ZodErrorMap {
  return overrideErrorMap;
}
