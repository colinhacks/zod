import type { ZodErrorMap } from "./ZodError";
import defaultErrorMap from "./locales/en";

let overrideErrorMap = defaultErrorMap;
export { defaultErrorMap };

export function setErrorMap(map: ZodErrorMap): void {
  overrideErrorMap = map;
}

export function getErrorMap(): ZodErrorMap {
  return overrideErrorMap;
}
