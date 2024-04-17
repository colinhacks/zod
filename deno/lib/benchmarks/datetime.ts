import Benchmark from "benchmark";

import { z } from "../index.ts";

const datetimeValidation = new Benchmark.Suite("datetime");
const DATA = "2020-01-01T00:00:00Z";
const datetimeRegex = z.datetimeRegex({});
console.log(datetimeRegex);
const MONTHS_31 = new Set([1, 3, 5, 7, 8, 10, 12]);
const MONTHS_30 = new Set([4, 6, 9, 11]);
datetimeValidation
  .add("new Date()", () => {
    const d = new Date(DATA);
    return !isNaN(d.getTime());
  })
  .add("regex validation", () => {
    return datetimeRegex.test(DATA);
  })
  .add("simple regex with validation", () => {
    // Regex to validate ISO 8601 format with 'Z' timezone
    const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;
    const match = DATA.match(regex);

    if (!match) {
      return false;
    }

    // Extract year, month, and day from the capture groups
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10); // month is 0-indexed in JavaScript Date, so subtract 1
    const day = parseInt(match[3], 10);
    if (month == 2) {
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        if (month === 2 && day > 29) {
          return false;
        }
      }
    }
    if (MONTHS_30.has(month) && day > 30) {
      return false;
    }
    if (MONTHS_31.has(month) && day > 31) {
      return false;
    }
    return true;
  })
  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${datetimeValidation.name!}: ${e.target}`);
  });

export default {
  suites: [datetimeValidation],
};
