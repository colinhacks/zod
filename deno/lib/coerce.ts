import { ZodBigInt, ZodBoolean, ZodDate, ZodNumber, ZodString } from "./types.ts";

const coerceString = ((arg) =>
  ZodString.create({ ...arg, coerce: true })) as (typeof ZodString)["create"];
const coerceNumber = ((arg) =>
  ZodNumber.create({ ...arg, coerce: true })) as (typeof ZodNumber)["create"];
const coerceBoolean = ((arg) =>
  ZodBoolean.create({
    ...arg,
    coerce: true,
  })) as (typeof ZodBoolean)["create"];
const coerceBigint = ((arg) =>
  ZodBigInt.create({ ...arg, coerce: true })) as (typeof ZodBigInt)["create"];
const coerceDate = ((arg) =>
  ZodDate.create({ ...arg, coerce: true })) as (typeof ZodDate)["create"];

export {
  coerceBigint as bigint,
  coerceBoolean as boolean,
  coerceDate as date,
  coerceNumber as number,
  coerceString as string,
};
