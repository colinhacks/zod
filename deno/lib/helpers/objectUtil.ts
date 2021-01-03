// import { ZodRawShape } from "../types/base";
// import { ZodRawShape } from "../types/base";
import { ZodRawShape, ZodIntersection } from "../index.ts";

// import { mergeObjects as mergeObjectsBase } from "../../types/object";
// import { mergeShapes as mergeShapesBase } from "./merge";

export namespace objectUtil {
  // export interface ZodObjectParams {
  //   strict: boolean;
  // }

  // export type MergeObjectParams<
  //   First extends ZodObjectParams,
  //   Second extends ZodObjectParams
  // > = {
  //   strict: First['strict'] extends false
  //     ? false
  //     : Second['strict'] extends false
  //     ? false
  //     : true;
  // };

  export type MergeShapes<U extends ZodRawShape, V extends ZodRawShape> = {
    [k in Exclude<keyof U, keyof V>]: U[k];
  } &
    V;

  type optionalKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? k : never;
  }[keyof T];

  type requiredKeys<T extends object> = Exclude<keyof T, optionalKeys<T>>;

  export type addQuestionMarks<T extends object> = {
    [k in optionalKeys<T>]?: T[k];
  } &
    { [k in requiredKeys<T>]: T[k] };

  // type ObjectIntersection<T extends ZodRawShape> = addQuestionMarks<
  //   {
  //     [k in keyof T]: T[k]['_type'];
  //   }
  // >;

  export type identity<T> = T;
  export type flatten<T extends object> = identity<{ [k in keyof T]: T[k] }>;

  export type NoNeverKeys<T extends ZodRawShape> = {
    [k in keyof T]: [T[k]] extends [never] ? never : k;
  }[keyof T];

  export type NoNever<T extends ZodRawShape> = identity<
    {
      [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
    }
  >;

  // export type ObjectType<T extends ZodRawShape> = flatten<
  //   ObjectIntersection<T>
  // >;
  // type ObjectIntersectionInput<T extends ZodRawShape> = addQuestionMarks<
  //   {
  //     [k in keyof T]: T[k]['_input'];
  //   }
  // >;
  // type ObjectIntersectionOutput<T extends ZodRawShape> = addQuestionMarks<
  //   {
  //     [k in keyof T]: T[k]['_output'];
  //   }
  // >;

  // export type objectInputType<T extends ZodObject<any, any, any>> = flatten<
  //   addQuestionMarks<
  //     {
  //       [k in keyof T['_shape']]: T['_shape'][k]['_input'];
  //     }
  //   >
  // >;

  // export type objectOutputType<T extends ZodObject<any, any, any>> = flatten<
  //   addQuestionMarks<
  //     {
  //       [k in keyof T['_shape']]: T['_shape'][k]['_output'];
  //     }
  //   >
  // >;

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

  // export const mergeObjects = mergeObjectsBase;
  // export const mergeShapes = mergeShapesBase;
}
