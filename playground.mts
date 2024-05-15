import z from "./src";
// import { z  } from "zod";
z;

const promiseSchema = z.promise(z.number());

const badData = Promise.resolve("XXX");
const badResult = await promiseSchema.safeParseAsync(badData);
console.log(badResult);
console.log(badResult.error);
