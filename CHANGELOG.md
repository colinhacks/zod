# Changelog

### 3.0.0-beta.1

- Moved default value logic into ZodDefault. Implemented `.nullish()` method.

### 3.0.0-alpha.33

- Added `.returnType` and `.parameters` methods to ZodFunction

### 3.0.0-alpha.32

- Added `.required()` method to ZodObject

### 3.0.0-alpha.30

- Added Rollup for bundling ESM module

### zod@3.0.0-alpha.24

- Added back ZodIntersection
- Added .and() method to base class

### zod@3.0.0-alpha.9

- Added `z.strictCreate`

### zod@3.0.0-alpha.8

- Allowing optional default values on ZodOptional

### zod@3.0.0-alpha.5

March 17, 2021

- Refactored parsing logic into individual subclass methods
- Eliminated ZodTypes to enable custom ZodType subclasses
- Removed ZodIntersection
- Added ZodEffects as a container for refinement and transform logic
- Added `or` method to `ZodType`
- Added `format` method to `ZodError`
- Added `unwrap` method to `ZodOptional` and `ZodNullable`
- Added new `default` method and moved default functionality into ZodOptional
- Implemented `z.setErrorMap`
- Exporting `z` variable from `index.ts` to enable `import { z } from 'zod';`

### zod@3.0.0-alpha.4

Jan 25, 2021

- New implementation of transformers
- Removed type guards

### zod@2

- Added ZodTransformer
- Async refinements

### zod@1.11

- Introduced `.safeParse` option
- Introduced .regex method on string schemas
- Implemented `.primitives()` and `.nonprimitives()` on object schemas
- Implemented `z.nativeEnum()` for creating schemas from TypeScript `enum`s
- Switched to `new URL()` constructor to check valid URLs

### zod@1.10

- Dropping support for TypeScript 3.2

### zod@1.9

- Added z.instanceof() and z.custom()
- Implemented ZodSchema.array() method

### zod@1.8

- Introduced z.void()
- Major overhaul to error handling system, including the introduction of custom error maps
- Wrote new [error handling guide](./ERROR_HANDLING.md)

### zod@1.7

- Added several built-in validators to string, number, and array schemas
- Calls to `.refine` now return new instance

### zod@1.5

- Introduces ZodAny and ZodUnknown

### zod@1.4

- Refinement types (`.refine`)
- Parsing no longer returns deep clone

### zod@1.3

- Promise schemas

### zod@1.2.6

- `.parse` accepts `unknown`
- `bigint` schemas

### zod@1.2.5

- `.partial` and `.deepPartial` on object schemas

### zod@1.2.3

- Added ZodDate

### zod@1.2.0

- Added `.pick`, `.omit`, and `.extend` on object schemas

### zod@1.1.0

- Added ZodRecord

### zod@1.0.11

- Added `.nonstrict`

### zod@1.0.10

- Added type assertions with `.check`

### zod@1.0.4

- Support for empty tuples

### zod@1.0.2

- Added type assertions
- Added ZodLiteral
- Added ZodEnum
- Improved error reporting

### zod@1.0.0

- Initial release
