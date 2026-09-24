#!/usr/bin/env bash
# Stage one package directory on npm: `npm stage publish` through OIDC trusted publishing.
#
# CI can only STAGE. The trusted publisher on zod and on @zod/mini is stage-only, so a version
# reaches the registry only once a maintainer approves it with 2FA — a proof of presence that no
# token, and no stolen push credential, can supply.
#
# Idempotent, because the job it runs in is re-run after a late approval: a version the registry
# already serves is skipped, and a version already sitting in the staged queue makes `npm stage
# publish` refuse, which counts as success here — the approval wait downstream is what decides
# whether the version arrived. That refusal's exact wording is matched loosely, since the first
# stage-only release is where it gets observed; anything else is fatal.
set -euo pipefail

dir="${1:?usage: npm-stage-publish.sh <package-dir> [npm stage publish flags...]}"
shift
version="${VERSION:?VERSION must name the version being staged}"

name="$(nub --node -p "require('./$dir/package.json').name")"
# registry.npmjs.org wants the scope separator percent-encoded: @zod/mini -> @zod%2fmini.
encoded="${name/\//%2f}"

if curl -sf "https://registry.npmjs.org/$encoded/$version" > /dev/null; then
  echo "$name@$version is already on the registry"
  exit 0
fi

echo "staging $name@$version"
out="$(mktemp)"
trap 'rm -f "$out"' EXIT
if (cd "$dir" && npm stage publish "$@") > "$out" 2>&1; then
  cat "$out"
  exit 0
fi
cat "$out"
if grep -qiE 'already (been )?staged|staged version|E409|EPUBLISHCONFLICT|previously published' "$out"; then
  echo "$name@$version is already staged; the approval wait decides the rest"
  exit 0
fi
echo "::error::staging $name@$version failed"
exit 1
