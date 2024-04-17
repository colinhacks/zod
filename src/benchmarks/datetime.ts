import Benchmark from "benchmark";

const datetimeValidationSuite = new Benchmark.Suite("datetime");

const DATA = "2020-01-01";
const MONTHS_31 = new Set([1, 3, 5, 7, 8, 10, 12]);
const MONTHS_30 = new Set([4, 6, 9, 11]);

function generateRandomDatetime(): string {
  const year = Math.floor(Math.random() * 3000);
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 31) + 1;
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

const simpleDatetimeRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
const datetimeRegexNoLeapYearValidation =
  /^\d{4}-((0[13578]|10|12)-31|(0[13-9]|1[0-2])-30|(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d))$/;
const datetimeRegexWithLeapYearValidation =
  /^((\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\d|3[01])|(0[469]|11)-(0[1-9]|[12]\d|30)|(02)-(0[1-9]|1\d|2[0-8])))$/;

const multiplesOf4 = new Set([
  "00",
  "04",
  "08",
  "12",
  "16",
  "20",
  "24",
  "28",
  "32",
  "36",
  "40",
  "44",
  "48",
  "52",
  "56",
  "60",
  "64",
  "68",
  "72",
  "76",
  "80",
  "84",
  "88",
  "92",
  "96",
]);

datetimeValidationSuite
  .add("new Date()", () => {
    return !isNaN(new Date(this.data).getTime());
  })
  .add("regex (no validation)", () => {
    return simpleDatetimeRegex.test(this.data);
  })
  .add("regex (no leap year)", () => {
    return datetimeRegexNoLeapYearValidation.test(this.data);
  })
  .add("selective leap year validation", () => {
    if (datetimeRegexNoLeapYearValidation.test(this.data)) {
      if (multiplesOf4.has(this.data.slice(2, 4))) {
        return;
      }
    }
    return false;
  })
  .add("regex (w/ leap year)", () => {
    return datetimeRegexWithLeapYearValidation.test(this.data);
  })
  .add("capture groups + code", () => {
    const match = this.data.match(simpleDatetimeRegex);
    if (!match) return false;

    // Extract year, month, and day from the capture groups
    const year = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10); // month is 0-indexed in JavaScript Date, so subtract 1
    const day = Number.parseInt(match[3], 10);

    if (month === 2) {
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        return day <= 29;
      }
      return day <= 28;
    }
    if (MONTHS_30.has(month)) {
      return day <= 30;
    }
    if (MONTHS_31.has(month)) {
      return day <= 31;
    }
    return false;
  })

  .on("cycle", (e: Benchmark.Event) => {
    console.log(`${datetimeValidationSuite.name!}: ${e.target}`);
  });

export default {
  suites: [datetimeValidationSuite],
};

datetimeValidationSuite.run({
  setup() {
    this.data = generateRandomDatetime();
  },
});
