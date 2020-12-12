import { ZodRawShape } from "../../types/base";
import { ZodIntersection } from "../../types/intersection";

export const mergeShapes = <U extends ZodRawShape, T extends ZodRawShape>(
  first: U,
  second: T
): T & U => {
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);
  const sharedKeys = firstKeys.filter((k) => secondKeys.indexOf(k) !== -1);

  const sharedShape: any = {};
  for (const k of sharedKeys) {
    sharedShape[k] = ZodIntersection.create(first[k], second[k]);
  }
  return {
    ...(first as object),
    ...(second as object),
    ...sharedShape,
  };
};
