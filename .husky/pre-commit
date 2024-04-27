#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
yarn build:deno
git add deno
