// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import { uglify } from "rollup-plugin-uglify";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "lib/index.mjs",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "tsconfig.esm.json",
        sourceMap: true,
      }),
      uglify(),
    ],
  },
];
