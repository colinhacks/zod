import * as z from "zod";

function parseData() {
  z.string().parse(1234);
}

function main() {
  parseData();
}

main();
