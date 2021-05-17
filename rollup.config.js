// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "lib/index.mjs",
        format: "es",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "tsconfig.esm.json",
      }),
    ],
  },
];
