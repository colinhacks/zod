import * as z from "zod";

function parseData() {
  z.string().parse(1234);
}

function main() {
  parseData();
}

// try {
//   main();
// } catch (e) {
//   console.log(e);
//   console.log(e.stack);
// }

main();
