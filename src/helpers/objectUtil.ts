import { ZodRawShape, ZodTypes } from '../types/base';
import { ZodIntersection } from '../types/intersection';
import { ZodObject } from '../types/object';

export namespace objectUtil {
  export interface ZodObjectParams {
    strict: boolean;
  }

  export type MergeObjectParams<First extends ZodObjectParams, Second extends ZodObjectParams> = {
    strict: First['strict'] extends false ? false : Second['strict'] extends false ? false : true;
  };

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

  type ObjectIntersection<T extends ZodRawShape> = AddQuestionMarks<
    {
      [k in keyof T]: T[k]['_type'];
    }
  >;

  type FlattenObject<T extends ZodRawShape> = { [k in keyof T]: T[k] };

  export type NoNeverKeys<T extends object> = {
    [k in keyof T]: T[k] extends never ? never : k;
  }[keyof T];

  // type test = (never) extends (never | string) ? true :false

  export type NoNever<T extends object> = {
    [k in NoNeverKeys<T>]: T[k];
  };

  export type ObjectType<T extends ZodRawShape> = FlattenObject<ObjectIntersection<NoNever<T>>>;

  export const mergeShapes = <U extends ZodRawShape, T extends ZodRawShape>(first: U, second: T): T & U => {
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

  export const mergeObjects = <FirstShape extends ZodRawShape, FirstParams extends ZodObjectParams>(
    first: ZodObject<FirstShape, FirstParams>,
  ) => <SecondShape extends ZodRawShape, SecondParams extends ZodObjectParams>(
    second: ZodObject<SecondShape, SecondParams>,
  ): ZodObject<FirstShape & SecondShape, MergeObjectParams<FirstParams, SecondParams>> => {
    const mergedShape = mergeShapes(first._def.shape, second._def.shape);
    const merged: any = new ZodObject({
      t: ZodTypes.object,
      // strict: first.params.strict && second.params.strict,
      params: {
        strict: first.params.strict && second.params.strict,
      },
      shape: mergedShape,
    }) as any;
    return merged;
  };
}
