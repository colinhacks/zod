// rollup.config.js
import typescript from "@rollup/plugin-typescript";
// import commonjs from "@rollup/plugin-commonjs";
// import { nodeResolve } from "@rollup/plugin-node-resolve";

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
      {
        file: "lib/index.umd.js",
        name: "Zod",
        format: "umd",
        sourcemap: false,
        exports: "named",
      },
      // {
      //   file: "lib/index.js",
      //   format: "cjs",
      //   sourcemap: false,
      //   exports: "named",
      // },
    ],
    plugins: [
      typescript({
        tsconfig: "./configs/tsconfig.esm.json",
        sourceMap: false,
      }),
      // nodeResolve(),
      // commonjs(),
    ],
  },
];
