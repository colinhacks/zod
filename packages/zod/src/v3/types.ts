import { util } from "./helpers/util.js";
import type { ZodTypeAny } from "./types/base.js";
import type { ZodEffects } from "./types/effects.js";
import type { ZodOptional, ZodNullable } from "./types/optional.js";
import type { ZodDefault } from "./types/default.js";
import type { ZodCatch } from "./types/catch.js";
import type { ZodBranded } from "./types/branded.js";
import type { ZodPipeline } from "./types/pipeline.js";
import type { ZodReadonly } from "./types/readonly.js";

export type TypeOf<T extends ZodTypeAny> = T["_output"];
export type InputOf<T extends ZodTypeAny> = T["_input"];

export type deoptional<T extends ZodTypeAny> = T extends ZodOptional<infer S>
  ? deoptional<S>
  : T extends ZodNullable<infer S>
    ? ZodNullable<deoptional<S>>
    : T extends ZodDefault<infer S>
      ? ZodDefault<deoptional<S>>
      : T extends ZodCatch<infer S>
        ? ZodCatch<deoptional<S>>
        : T extends ZodReadonly<infer S>
          ? ZodReadonly<deoptional<S>>
          : T extends ZodEffects<infer S>
            ? ZodEffects<deoptional<S>>
            : T extends ZodPipeline<infer A, infer B>
              ? ZodPipeline<deoptional<A>, deoptional<B>>
              : T extends ZodBranded<infer S, infer B>
                ? ZodBranded<deoptional<S>, B>
                : T;

export type SomeZodObject = ZodObject<any, any, any>;

export type UnknownKeysParam = "passthrough" | "strict" | "strip";

export type ParseParams = {
  path?: (string | number)[];
  errorMap?: ZodErrorMap;
  async?: boolean;
};

export type CustomErrorParams = Partial<util.Omit<ParseParams, "path">>;

export type ZodErrorMap = typeof defaultErrorMap;
export type ZodTypeAny = import("./ZodType.js").ZodTypeAny;
export type ZodRawShape = {
  [k: string]: ZodTypeAny;
};

export interface ZodObjectDef<T extends ZodRawShape = ZodRawShape, UnknownKeys extends UnknownKeysParam = UnknownKeysParam, Catchall extends ZodTypeAny = ZodTypeAny> {
  typeName: "ZodObject";
  shape: () => T;
  catchall: Catchall;
  unknownKeys: UnknownKeys;
}

export type baseObjectOutputType<T extends ZodRawShape> = {
  -readonly [k in keyof T]: TypeOf<T[k]>;
};

export type objectOutputType<T extends ZodRawShape, Catchall extends ZodTypeAny> = baseObjectOutputType<T> & TypeOf<Catchall>;

export type objectInputType<T extends ZodRawShape, Catchall extends ZodTypeAny> = {
  [k in keyof T]: InputOf<T[k]>;
} & InputOf<Catchall>;

export type noUnrecognized<UnknownKeys extends UnknownKeysParam> =
  UnknownKeys extends "passthrough" ? { [k: string]: unknown } :
  UnknownKeys extends "strict" ? {} :
  unknown;

export type noUnrecognizedForOutput<UnknownKeys extends UnknownKeysParam> =
  UnknownKeys extends "passthrough" ? { [k: string]: unknown } :
  {};

export type AugmentFactory<Def extends ZodObjectDef> = <
  Augmentation extends ZodRawShape,
 >(augmentation: Augmentation) => ZodObject<
  T & Augmentation,
  Def["unknownKeys"],
  Def["catchall"]
>;

export type Augmented<T extends ZodTypeAny> = T extends ZodObject<infer Def, infer UnknownKeys, infer Catchall>
  ? ZodObject<Def, UnknownKeys, Catchall> & {
      augment: AugmentFactory<ZodObjectDef<Def, UnknownKeys, Catchall>>;
    }
  : never;

export class ZodObject<T extends ZodRawShape, UnknownKeys extends UnknownKeysParam, Catchall extends ZodTypeAny> extends ZodType<
  objectOutputType<T, Catchall>,
  objectInputType<T, Catchall>,
  unknown
> {
  declare _output: objectOutputType<T, Catchall> & noUnrecognizedForOutput<UnknownKeys>;
  declare _input: objectInputType<T, Catchall> & noUnrecognized<UnknownKeys>;

  // ... rest of the class implementation remains unchanged
}