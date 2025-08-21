# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The project uses pnpm workspaces. Key commands:

- `pnpm build` - Build all packages (runs recursive build command)
- `pnpm test` - Run all tests with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm dev` - Execute code with tsx under source conditions
- `pnpm dev <file>` - Execute `<file>` with tsx & proper resolution conditions. Usually use for `play.ts`.
- `pnpm lint` - Run biome linter with auto-fix
- `pnpm format` - Format code with biome
- `pnpm fix` - Run both format and lint

### Testing

- Tests use Vitest with workspace-based configuration
- Test files are located in `src/*/tests/` directories
- Run specific tests: `pnpm test <pattern>` or `pnpm test --filter <workspace> <pattern>`
- Tests include type checking via `typecheck.enabled = true`

### Package-Specific Commands

In the `packages/zod/` workspace:
- `pnpm build` - Uses zshy build tool with tsconfig.build.json
- `pnpm clean` - Clean build artifacts (preserving node_modules)

## Architecture Overview

Zod is a TypeScript-first schema validation library organized as a monorepo with multiple versions and variants:

### Repository Structure

- **Root**: Monorepo configuration with pnpm workspaces
- **packages/zod/**: Main Zod package with multiple version exports
- **packages/docs/**: Documentation website (Next.js)
- **packages/bench/**: Performance benchmarks
- **packages/resolution/**: Module resolution testing
- **packages/treeshake/**: Bundle size analysis
- **packages/tsc/**: TypeScript compilation benchmarks

### Version Architecture

The main zod package exports multiple versions:

1. **v4 (default)**: Current version, exports from `v4/classic/external.js`
2. **v4/core**: Core v4 implementation without legacy compatibility
3. **v4/mini**: Lightweight v4 variant
4. **v3**: Legacy version for backward compatibility
5. **mini**: General minimal build

### Key Implementation Files

- `src/v4/core/`: Core validation logic, schemas, parsing, and error handling
- `src/v4/classic/`: v4 with legacy compatibility layer
- `src/v4/mini/`: Minimal v4 implementation
- `src/v3/`: Legacy v3 implementation
- `src/locales/`: Internationalization support

### Export Strategy

The package uses conditional exports with:
- `@zod/source`: Development condition pointing to TypeScript source
- Standard ESM/CJS exports for distribution
- Multiple entry points for different versions and variants

## Code Standards

### Linting and Formatting

- Uses Biome for both linting and formatting
- Line width: 120 characters
- Trailing commas: ES5 style for JavaScript, none for JSON
- Notable lint rule relaxations:
  - `noExplicitAny: "off"` - `any` is allowed
  - `noParameterAssign: "off"` - Required for performance optimizations
  - `noNonNullAssertion: "off"` - Non-null assertions are allowed

### TypeScript Configuration

- Strict mode enabled with exact optional property types
- Node.js module resolution (NodeNext)
- Target: ES2020
- Custom conditions support for `@zod/source`

## Development Workflow

1. Use `play.ts` for initial experimentation with `pnpm dev play.ts`
2. Write tests in appropriate `tests/` directories
3. Build with `pnpm build` before testing changes
4. Run linting/formatting with `pnpm fix`
5. All changes must pass tests and type checking

## Build System

- Uses `zshy` build tool for the main package
- Generates both ES modules and CommonJS outputs
- Supports source maps and declaration files
- Post-build formatting with Biome

## Performance Considerations

- Performance is critical - parameter reassignment is allowed for optimization
- Benchmarks available in `packages/bench/`
- Bundle size monitoring in `packages/treeshake/`
- TypeScript compilation performance tracked in `packages/tsc/`
