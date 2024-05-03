// rollup.config.js
// node resolve
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "lib/index.mjs",
        format: "es",
        sourcemap: false,
        exports: "named",
      },
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: "./configs/tsconfig.esm.json",
        sourceMap: false,
      }),
    ],
    external: ["zod", "effect"],
  },
];
