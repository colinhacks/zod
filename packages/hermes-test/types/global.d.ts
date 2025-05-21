/**
 * Global type definitions for Hermes compatibility testing
 */

// Add Hermes type to global scope
interface Window {
  HermesInternal?: object;
}

// Make TypeScript aware of the global HermesInternal object
declare global {
  var HermesInternal: object | undefined;
}

// Augment Zod types to allow for internal property access in tests
declare module "zod" {
  interface ZodType {
    _zod: {
      traits: Set<string>;
      def: any;
      [key: string]: any;
    };
    def: any;
  }
}
