import * as z from "zod";

z;

const stringToDate = z.codec(
  z.iso.datetime(), // input schema: ISO date string
  z.date(), // output schema: Date object
  {
    decode: (isoString) => new Date(isoString), // ISO string → Date
    encode: (date) => date.toISOString(), // Date → ISO string
  }
);

stringToDate.decode("2024-01-15T10:30:00.000Z");
// => Date

stringToDate.encode(new Date())
// => string


      stringToDate.decode(1234);
      //                 ^ Argument of type 'number' is not assignable 
      //                   to parameter of type 'string'.ts(2345)

      stringToDate.encode(1234);
      //                 ^ Argument of type 'number' is not assignable 
      //                   to parameter of type 'Date'.ts(2345)



including:

✅ stringToNumber
✅ stringToInt
✅ stringToBigInt
✅ numberToBigInt
✅ isoDatetimeToDate
✅ epochSecondsToDate
✅ epochMillisToDate
✅ jsonCodec
✅ utf8ToBytes
✅ bytesToUtf8
✅ base64ToBytes
✅ base64urlToBytes
✅ hexToBytes
✅ stringToURL
✅ uriComponent
