import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodCodecDef<T extends z.ZodTypeAny = z.ZodTypeAny, U extends z.ZodTypeAny = z.ZodTypeAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.codec;
  input: T;
  output: U;
  transformer: (arg: T['_type']) => U['_type'];
}

export class ZodCodec<T extends z.ZodTypeAny, U extends z.ZodTypeAny> extends z.ZodType<U['_type'], ZodCodecDef<T, U>> {
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  get input() {
    return this._def.input;
  }
  get output() {
    return this._def.output;
  }

  toJSON = () => ({
    t: this._def.t,
    left: this._def.input.toJSON(),
    right: this._def.output.toJSON(),
  });

  static create = <T extends z.ZodTypeAny, U extends z.ZodTypeAny>(
    input: T,
    output: U,
    transformer: (arg: T['_type']) => U['_type'],
  ): ZodCodec<T, U> => {
    return new ZodCodec({
      t: z.ZodTypes.codec,
      input,
      output,
      transformer,
    });
  };
}
