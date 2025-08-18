import * as z from "zod/v4";

// ISO string -> Date codec using z.iso.date() for input validation
const isoDateCodec = z
  .codec(
    z.iso.datetime(), // Input: ISO string (validates to string)
    z.date(), // Output: Date object
    {
      decode: (isoString) => new Date(isoString), // Forward: ISO string → Date
      encode: (date) => date.toISOString(), // Backward: Date → ISO string
    }
  )
  .refine((val) => {
    console.log(val);
    console.log(typeof val);
    return val.getFullYear() === 2024;
  });

const isoDatePipe = z
  .pipe(
    z.iso.datetime(),
    z.pipe(
      z.transform((val: string) => new Date(val)),
      z.date()
    )
  )
  .refine((val) => {
    console.log(val);
    console.log(typeof val);
    return val.getFullYear() === 2024;
  });

// Test data
const testIsoString = "2024-01-15T10:30:00.000Z";
const testDate = new Date("2024-01-15T10:30:00.000Z");

console.log("=== ISO String -> Date Codec Test ===\n");

// // Forward decoding (ISO string -> Date)
// console.log("1. Forward decoding (string -> Date):");
// console.log(`Input:  "${testIsoString}"`);
// const decodedResult = z.decode(isoDateCodec, testIsoString);
// // console.log(`Output: $/{{ decodedResult }}`);
// console.log("Output:", decodedResult);
// console.log(`Type:   ${decodedResult.constructor.name}\n`);

// // Backward encoding (Date -> ISO string)
// console.log("2. Backward encoding (Date -> string):");
// console.log(`Input:  ${testDate}`);
// const encodedResult = z.encode(isoDateCodec, testDate);
// // console.log(`Output: "${encodedResult}"`);
// console.log("Output:", encodedResult);
// console.log(`Type:   ${typeof encodedResult}\n`);

// // Round trip test
// console.log("3. Round trip test:");
// const original = "2024-12-25T15:45:30.123Z";
// const toDate = z.decode(isoDateCodec, original);
// console.log({ toDate });
// const backToString = z.encode(isoDateCodec, toDate);
// console.log("original:", original);
// console.log("backToString:", backToString);
// console.log(`Round trip:   ${original === backToString ? "✅ Success" : "❌ Failed"}\n`);

// Safe parsing examples
console.log("4. Safe parsing examples:");
const safeDecodeResultA = z.parse(isoDatePipe, "invalid-date");
console.log(safeDecodeResultA);
// const safeDecodeResult = z.safeDecode(isoDateCodec, "invalid-date");
// console.log(
//   "Safe decode invalid:",
//   safeDecodeResult.success ? "✅" : "❌",
//   safeDecodeResult.success ? safeDecodeResult.data : safeDecodeResult.error.issues[0].message
// );

// const safeEncodeResult = z.safeEncode(isoDateCodec, new Date("2024-01-01"));
// console.log(
//   "Safe encode valid:  ",
//   safeEncodeResult.success ? "✅" : "❌",
//   safeEncodeResult.success ? `"${safeEncodeResult.data}"` : safeEncodeResult.error.issues[0].message
// );
