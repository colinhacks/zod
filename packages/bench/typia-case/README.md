# typia case

typia generates its validators with a TypeScript transformer, so this directory holds a prebuilt artifact rather than a source import. `build/index.cjs` is generated from `src/index.ts`.

The transformer does not run inside this workspace: `tspc` live mode crashes on typia's file transformer, and the alternative — `ts-patch install` — patches the TypeScript that every package here shares. The artifact is therefore built in a throwaway project and copied in. The generated file inlines every check, so it depends only on the `typia` runtime already in this package.

To regenerate:

```sh
mkdir -p /tmp/typia-build/src && cd /tmp/typia-build
npm init -y
npm install typia@9.7.2 typescript@5.9.3 ts-patch@3.3.0
cp <repo>/packages/bench/typia-case/src/index.ts src/index.ts
cp <repo>/packages/bench/typia-case/tsconfig.json tsconfig.json
npx ts-patch install && npx tsc -p tsconfig.json
cp build/index.js <repo>/packages/bench/typia-case/build/index.cjs
```
