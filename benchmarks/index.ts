import { execa } from "execa";

const $ = execa({ stdout: "inherit", stderr: "inherit" });

async function run() {
  console.log(process.argv[2].split(","));
  const files = process.argv[2]
    .split(",")
    .map((file) => import.meta.resolve(`./${file}`).replace("file://", ""));

  for (const file of files) {
    console.log(`Running ${file}`);
    await $`pnpm tsx ${file}`;
  }
}

run();

// exit on Ctrl-C
process.on("SIGINT", () => {
  console.log("Exiting...");
  process.exit();
});
