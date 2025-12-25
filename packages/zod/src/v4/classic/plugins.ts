/**
 * Extension namespace for Zod plugins
 *
 * This provides a safe, mutable namespace for community plugins to register
 * custom validators and utilities without modifying the core frozen `z` object.
 *
 * @example
 * ```ts
 * // Plugin author:
 * import { z } from 'zod';
 *
 * z.ext.cron = () => {
 *   return z.string().refine(
 *     (val) => /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3]))/.test(val),
 *     { message: "Invalid cron expression" }
 *   );
 * };
 *
 * // Plugin consumer:
 * import 'my-zod-cron-plugin';
 * import { z } from 'zod';
 *
 * const cronSchema = z.ext.cron();
 * ```
 */

// Use a simple object that can be mutated
// This avoids issues with frozen objects in production builds
export const ext: Record<string, any> = {};

/**
 * Type augmentation interface for TypeScript support
 *
 * Plugin authors should augment this interface in their type declarations:
 *
 * @example
 * ```ts
 * declare module 'zod' {
 *   namespace z {
 *     namespace ext {
 *       function cron(): ZodString;
 *     }
 *   }
 * }
 * ```
 */
export interface ZodExtensions {}
