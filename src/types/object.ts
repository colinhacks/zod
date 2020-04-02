import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';
import { ZodIntersection } from './intersection';

export interface ZodShapeDef<T extends z.ZodRawShape = z.ZodRawShape> extends z.ZodTypeDef {
  t: z.ZodTypes.object;
  shape: T;
}

export interface ZodObjectDef<T extends z.ZodRawShape = z.ZodRawShape> extends z.ZodTypeDef {
  t: z.ZodTypes.object;
  shape: T;
  strict: boolean;
}

type OptionalKeys<T extends z.ZodRawShape> = {
  [k in keyof T]: undefined extends T[k]['_type'] ? k : never;
}[keyof T];
type RequiredKeys<T extends z.ZodRawShape> = Exclude<keyof T, OptionalKeys<T>>;
type ObjectIntersection<T extends z.ZodRawShape> = {
  [k in OptionalKeys<T>]?: T[k]['_type'];
} &
  { [k in RequiredKeys<T>]: T[k]['_type'] };
type Flatten<T extends object> = { [k in keyof T]: T[k] };
type FlattenObject<T extends z.ZodRawShape> = { [k in keyof T]: T[k] };
type ObjectType<T extends z.ZodRawShape> = FlattenObject<ObjectIntersection<T>>;

const mergeShapes = <U extends z.ZodRawShape, T extends z.ZodRawShape>(first: U, second: T): T & U => {
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

type MergeObjectParams<First extends ZodObjectParams, Second extends ZodObjectParams> = {
  strict: First['strict'] extends false ? false : Second['strict'] extends false ? false : true;
};

const mergeObjects = <FirstShape extends z.ZodRawShape, FirstParams extends ZodObjectParams>(
  first: ZodObject<FirstShape, FirstParams>,
) => <SecondShape extends z.ZodRawShape, SecondParams extends ZodObjectParams>(
  second: ZodObject<SecondShape, SecondParams>,
): ZodObject<FirstShape & SecondShape, MergeObjectParams<FirstParams, SecondParams>> => {
  const mergedShape = mergeShapes(first._def.shape, second._def.shape);
  const merged: any = new ZodObject({
    t: z.ZodTypes.object,
    strict: first._def.strict && second._def.strict,
    shape: mergedShape,
  }) as any;
  return merged;
};

const objectDefToJson = (def: ZodObjectDef<any>) => ({
  t: def.t,
  shape: Object.assign(
    {},
    Object.keys(def.shape).map(k => ({
      [k]: def.shape[k].toJSON(),
    })),
  ),
});

interface ZodObjectParams {
  strict: boolean;
}

type SetKey<Target extends object, Key extends string, Value extends any> = Flatten<
  { [k in Exclude<keyof Target, Key>]: Target[k] } & { [k in Key]: Value }
>;

type ZodObjectType<T extends z.ZodRawShape, Params extends ZodObjectParams> = Params['strict'] extends true
  ? ObjectType<T>
  : Flatten<ObjectType<T> & { [k: string]: any }>;

export class ZodObject<T extends z.ZodRawShape, Params extends ZodObjectParams = { strict: true }> extends z.ZodType<
  ZodObjectType<T, Params>, // { [k in keyof T]: T[k]['_type'] },
  ZodObjectDef<T>
> {
  readonly _shape!: T;
  readonly _params!: Params;
  toJSON = () => objectDefToJson(this._def);

  nonstrict = (): ZodObject<T, SetKey<Params, 'strict', false>> =>
    new ZodObject({
      shape: this._def.shape,
      strict: false,
      t: z.ZodTypes.object,
    });

  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge: <MergeShape extends z.ZodRawShape, MergeParams extends ZodObjectParams>(
    other: ZodObject<MergeShape, MergeParams>,
  ) => ZodObject<T & MergeShape, MergeObjectParams<Params, MergeParams>> = mergeObjects(this);

  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  // relations = <Rels extends { [k: string]: any }>(
  //   lazyShape: { [k in keyof Rels]: ZodLazy<z.ZodType<Rels[k]>> },
  // ): RelationsReturnType<Rels, T> => {
  //   // const relationShape: any = {};
  //   // for (const key in lazyShape) {
  //   //   relationShape[key] = lazyShape[key]();
  //   // }
  //   // console.log(relationShape);
  //   // const relationKeys = Object.keys(lazyShape);
  //   // const existingKeys = Object.keys(this._def.shape);
  //   return new ZodObject({
  //     t: z.ZodTypes.object,
  //     strict: this._def.strict,
  //     shape: {
  //       ...this._def.shape,
  //       ...lazyShape,
  //     },
  //   }) as any;
  // };

  static create = <T extends z.ZodRawShape>(shape: T): ZodObject<T> => {
    return new ZodObject({
      t: z.ZodTypes.object,
      strict: true,
      shape,
    });
  };

  // static recursion = <R extends { [k: string]: any }>() => <T extends ZodObject<any>>(
  //   shape: withRefsInputType<T, R>,
  // ): ZodObject<withRefsReturnType<T, R>> => {
  //   //  const getters =
  //   return new ZodObject({ t: z.ZodTypes.object, strict: true, shape(); });
  // };
}

// type RelationsReturnType<Rels extends { [k: string]: any }, Shape extends z.ZodRawShape> = ZodObject<
//   Without<Shape, keyof Rels> & { [k in keyof Rels]: ZodLazy<z.ZodType<Rels[k]>> }
// >;

// type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

// type withRefsInputType<T extends z.ZodObject, Refs extends { [k in keyof T]: any }> = ZodObject<
//   Without<T['_shape'], keyof Refs> & { [k in keyof Refs]: ZodLazy<Refs[k]> }
// >;
// type withRefsReturnType<T extends z.ZodRawShape, Refs extends { [k in keyof T]?: any }> = Without<T, keyof Refs> &
//   { [k in keyof Refs]: z.ZodType<Refs[k]> };
