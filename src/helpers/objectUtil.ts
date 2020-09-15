import { ZodRawShape, ZodTypes } from '../types/base';
import { ZodIntersection } from '../types/intersection';
import { ZodObject } from '../types/object';

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

  export type Flatten<T extends object> = { [k in keyof T]: T[k] };
  type OptionalKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? k : never;
  }[keyof T];

  type RequiredKeys<T extends object> = Exclude<keyof T, OptionalKeys<T>>;

  type AddQuestionMarks<T extends object> = {
    [k in OptionalKeys<T>]?: T[k];
  } &
    { [k in RequiredKeys<T>]: T[k] };

  // type ObjectIntersection<T extends ZodRawShape> = AddQuestionMarks<
  //   {
  //     [k in keyof T]: T[k]['_type'];
  //   }
  // >;
  type ObjectIntersectionInput<T extends ZodRawShape> = AddQuestionMarks<
    {
      [k in keyof T]: T[k]['_input'];
    }
  >;
  type ObjectIntersectionOutput<T extends ZodRawShape> = AddQuestionMarks<
    {
      [k in keyof T]: T[k]['_output'];
    }
  >;

  type Identity<T> = T;
  type FlattenObject<T extends ZodRawShape> = Identity<
    { [k in keyof T]: T[k] }
  >;

  export type NoNeverKeys<T extends ZodRawShape> = {
    [k in keyof T]: [T[k]] extends [never] ? never : k;
  }[keyof T];

  export type NoNever<T extends ZodRawShape> = Identity<
    {
      [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
    }
  >;

  // export type ObjectType<T extends ZodRawShape> = FlattenObject<
  //   ObjectIntersection<T>
  // >;
  export type ObjectTypeInput<T extends ZodRawShape> = FlattenObject<
    ObjectIntersectionInput<T>
  >;
  export type ObjectTypeOutput<T extends ZodRawShape> = FlattenObject<
    ObjectIntersectionOutput<T>
  >;

  // export type ObjectType<T extends ZodRawShape> = FlattenObject<ObjectIntersection<T>>;

  export const mergeShapes = <U extends ZodRawShape, T extends ZodRawShape>(
    first: U,
    second: T,
  ): T & U => {
    const firstKeys = Object.keys(first);
    const secondKeys = Object.keys(second);
    const sharedKeys = firstKeys.filter(k => secondKeys.indexOf(k) !== -1);

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

  export const mergeObjects = <First extends ZodObject<any, any, any>>(
    first: First,
  ) => <Second extends ZodObject<any, any, any>>(
    second: Second,
  ): ZodObject<
    First['_shape'] & Second['_shape'],
    First['_unknownKeys'],
    // MergeObjectParams<First['_params'], Second['_params']>,
    First['_input'] & Second['_input'],
    First['_output'] & Second['_output']
  > => {
    const mergedShape = mergeShapes(first._def.shape(), second._def.shape());
    const merged: any = new ZodObject({
      t: ZodTypes.object,
      checks: [...(first._def.checks || []), ...(second._def.checks || [])],
      unknownKeys: first._def.unknownKeys,
      // params: {
      //   strict: first.params.strict && second.params.strict,
      // },
      shape: () => mergedShape,
    }) as any;
    return merged;
  };
}
