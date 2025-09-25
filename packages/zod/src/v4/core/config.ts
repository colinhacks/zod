import type * as errors from "./errors.js";

export interface $ZodConfig {
  /** Custom error map. Overrides `config().localeError`. */
  customError?: errors.$ZodErrorMap | undefined;
  /** Localized error map. Lowest priority. */
  localeError?: errors.$ZodErrorMap | undefined;
}

export const globalConfig: $ZodConfig = Object.create(null);

export function config(config?: Partial<$ZodConfig>): $ZodConfig {
  if (config) Object.assign(globalConfig, config);
  return globalConfig;
}
