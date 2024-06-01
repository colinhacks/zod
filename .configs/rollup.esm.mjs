// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.mjs",
        format: "es",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "../tsconfig.json",
      }),
    ],
  },
];
