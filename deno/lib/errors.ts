import defaultErrorMap from "./locales/en.ts";
import type { ZodErrorMap } from "./ZodError.ts";

let overrideErrorMap = defaultErrorMap;
export { defaultErrorMap };

export function setErrorMap(map: ZodErrorMap) {
  overrideErrorMap = map;
}

export function getErrorMap() {
  return overrideErrorMap;
}
