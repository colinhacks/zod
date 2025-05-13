import * as z from "zod";

export function parseData() {
  z.string().parse(1234);
}

export function main() {
  parseData();
}

main();
