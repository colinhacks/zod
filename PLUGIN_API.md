# Zod Plugin API

Zod provides a safe, mutable `z.ext` namespace for community plugins to extend Zod's functionality without modifying the core frozen `z` object.

## Motivation

Direct property assignment to the frozen `z` namespace fails in production builds:

```typescript
// ❌ This fails in production
z.iso.timezone = () => z.string().check(...);
// TypeError: Cannot assign to read only property
```

The `z.ext` namespace solves this by providing a dedicated, mutable space for plugins.

## Creating a Plugin

### Basic Example

```typescript
// my-zod-cron-plugin/index.ts
import { z } from 'zod';

// Add your validator to z.ext
z.ext.cron = () => {
  return z.string().refine(
    (val) => /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3]))/.test(val),
    { message: "Invalid cron expression" }
  );
};

// Type augmentation for TypeScript support
declare module 'zod' {
  namespace z {
    namespace ext {
      function cron(): ZodString;
    }
  }
}
```

### Using a Plugin

```typescript
// Consumer code
import 'my-zod-cron-plugin'; // Side-effect import registers the plugin
import { z } from 'zod';

const cronSchema = z.ext.cron();
cronSchema.parse("0 0"); // ✅ Valid
cronSchema.parse("invalid"); // ❌ Throws error
```

## Advanced Patterns

### Plugin with Configuration

```typescript
z.ext.url = (options?: { allowHttp?: boolean }) => {
  return z.string().refine(
    (val) => {
      try {
        const url = new URL(val);
        if (options?.allowHttp === false && url.protocol === "http:") {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid URL" }
  );
};

// Type augmentation
declare module 'zod' {
  namespace z {
    namespace ext {
      function url(options?: { allowHttp?: boolean }): ZodString;
    }
  }
}
```

Usage:

```typescript
const httpsOnlyUrl = z.ext.url({ allowHttp: false });
const anyUrl = z.ext.url();
```

### Factory Plugin

```typescript
z.ext.range = (min: number, max: number, options?: { inclusive?: boolean }) => {
  const inclusive = options?.inclusive ?? true;
  return z.number().refine(
    (val) => {
      if (inclusive) {
        return val >= min && val <= max;
      }
      return val > min && val < max;
    },
    { message: `Value must be ${inclusive ? "between" : "strictly between"} ${min} and ${max}` }
  );
};

declare module 'zod' {
  namespace z {
    namespace ext {
      function range(
        min: number,
        max: number,
        options?: { inclusive?: boolean }
      ): ZodNumber;
    }
  }
}
```

## Best Practices

### 1. Use Descriptive Names

```typescript
// ✅ Good
z.ext.hexColor = () => z.string().regex(/^#[0-9A-Fa-f]{6}$/);

// ❌ Avoid generic names that might conflict
z.ext.validate = () => ...;
```

### 2. Provide Type Declarations

Always include TypeScript type augmentation to ensure IDE autocomplete and type safety:

```typescript
declare module 'zod' {
  namespace z {
    namespace ext {
      function yourPlugin(): ZodType;
    }
  }
}
```

### 3. Document Your Plugin

Include examples, error messages, and edge cases in your plugin documentation.

### 4. Keep It Composable

Plugins should return standard Zod schemas that can be chained:

```typescript
const schema = z.ext.email().optional().default("no-reply@example.com");
```

## Publishing a Plugin

1. **Package Structure:**
   ```
   my-zod-plugin/
   ├── src/
   │   └── index.ts     # Plugin implementation
   ├── dist/            # Compiled output
   ├── package.json
   ├── README.md
   └── tsconfig.json
   ```

2. **Package.json:**
   ```json
   {
     "name": "zod-plugin-yourname",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "peerDependencies": {
       "zod": "^4.0.0"
     }
   }
   ```

3. **Side Effects:**
   Ensure your plugin has side effects (it modifies `z.ext`):
   ```json
   {
     "sideEffects": true
   }
   ```

## Example Plugins

### Email Validator

```typescript
import { z } from 'zod';

z.ext.advancedEmail = (options?: {
  allowSubaddressing?: boolean;
  blockedDomains?: string[];
}) => {
  return z.string().email().refine(
    (email) => {
      if (!options) return true;

      const domain = email.split('@')[1];

      if (options.blockedDomains?.includes(domain)) {
        return false;
      }

      if (options.allowSubaddressing === false && email.includes('+')) {
        return false;
      }

      return true;
    },
    { message: "Email does not meet requirements" }
  );
};
```

### JSON Validator

```typescript
z.ext.json = <T extends z.ZodType>(schema?: T) => {
  return z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      if (schema) {
        const result = schema.safeParse(parsed);
        if (!result.success) {
          result.error.issues.forEach((issue) => ctx.addIssue(issue));
          return z.NEVER;
        }
        return result.data;
      }
      return parsed;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON",
      });
      return z.NEVER;
    }
  });
};
```

## Migration from Direct Augmentation

If you previously augmented `z` directly, migrate to `z.ext`:

```typescript
// ❌ Old approach (breaks in production)
z.myValidator = () => z.string();

// ✅ New approach
z.ext.myValidator = () => z.string();
```

## Benefits

1. **Bundler-safe:** Works in all production environments
2. **Ecosystem growth:** Standardized format for community plugins
3. **Discoverability:** Extensions remain under `z.ext.*` with IDE autocomplete
4. **No breaking changes:** Core `z` object remains unchanged

## Limitations

- Plugins are registered globally per `z` import
- No built-in plugin conflict detection (choose unique names)
- Side-effect imports required (can affect tree-shaking)

## Related Issues

- [#5544](https://github.com/colinhacks/zod/issues/5544) - Original proposal
