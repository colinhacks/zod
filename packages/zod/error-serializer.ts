import { SnapshotSerializer } from "vitest";
import { $ZodError } from "./src/v4/core/errors.js";

export default {
  test: (subject) => subject instanceof $ZodError,
  serialize(error: $ZodError, config, indentation, depth, refs, printer) {
    const {message, issues, name} = error;
    return `${name} (${printer(
      { message, issues },
      config,
      indentation,
      depth,
      refs,
    )})`
  },
} satisfies SnapshotSerializer as object;