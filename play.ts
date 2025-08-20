import * as z from "zod";

// // z.string();

// // z.string().parse("asd", {});

// const stringToDate = z.codec(
//   z.iso.datetime(), // input schema: ISO date string
//   z.date(), // output schema: Date object
//   {
//     decode: (isoString) => new Date(isoString), // ISO string → Date
//     encode: (date) => date.toISOString(), // Date → ISO string
//   }
// );

// const tx = z.success(z.string().transform((val) => val.length));
// console.log(tx);
// z.encode(tx, 12345 as any);

const stringbool = z.stringbool({ truthy: ["yes", "y"], falsy: ["no", "n"] });

console.log(z.encode(stringbool, true)); // => "yes"
console.log(z.encode(stringbool, false)); // => "no"
