#!/usr/bin/env bash
# Test runner for exact length error messages challenge
#
# Usage:
#   ./test.sh [--output_path <junit.xml>] <base|new>
#
#   base  run the existing repository tests in the change's blast radius
#   new   run the new challenge tests

set -uo pipefail

cd /app

OUTPUT_PATH=""
if [ "${1:-}" = "--output_path" ]; then
  OUTPUT_PATH="$2"
  shift 2
fi

MODE="${1:-new}"

TEST_LOG="$(mktemp)"
STATUS=0

run_tests() {
  regex="$1"
  shift
  if [ -n "$regex" ]; then
    npx vitest run "$regex" --reporter=verbose 2>&1 | tee -a "$TEST_LOG"
  else
    npx vitest run "$@" --reporter=verbose 2>&1 | tee -a "$TEST_LOG"
  fi
  status=${PIPESTATUS[0]}
  if [ "$status" -ne 0 ]; then
    STATUS=$status
  fi
}

case "$MODE" in
  base)
    # Run existing tests in the blast radius
    run_tests "array.test.ts|validations.test.ts" src/v4/classic/tests/
    ;;
  new)
    # Run the new test file
    run_tests "exact-length-error-message" src/v4/classic/tests/
    ;;
  *)
    echo "unknown mode: $MODE (expected base or new)" >&2
    exit 2
    ;;
esac

if [ -n "$OUTPUT_PATH" ]; then
  # Convert vitest output to JUnit XML
  npx vitest run --reporter=junit > "$OUTPUT_PATH" 2>&1 || true
fi

exit "$STATUS"