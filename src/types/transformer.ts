import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodTransformerDef<T extends z.ZodTypeAny = z.ZodTypeAny, U extends z.ZodTypeAny = z.ZodTypeAny>
  extends z.ZodTypeDef {
  t: z.ZodTypes.transformer;
  input: T;
  output: U;
  transformer: (arg: T['_type']) => U['_type'];
}

export class ZodTransformer<T extends z.ZodTypeAny, U extends z.ZodTypeAny> extends z.ZodType<
  U['_type'],
  ZodTransformerDef<T, U>
> {
  readonly _input!: T['_type'];
  readonly _output!: U['_type'];
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

  // transformTo: <Out extends z.ZodTypeAny>(
  //   output: Out,
  //   transformer: (arg: U['_type']) => Out['_type'],
  // ) => ZodTransformer<this, Out> = (output, transformer) => {
  //   return ZodTransformer.create(this as any, output, transformer) as any;
  // };

  static create = <I extends z.ZodTypeAny, O extends z.ZodTypeAny>(
    input: I,
    output: O,
    transformer: (arg: I['_type']) => O['_type'],
  ): ZodTransformer<I, O> => {
    return new ZodTransformer({
      t: z.ZodTypes.transformer,
      input,
      output,
      transformer,
    });
  };

  static fromSchema = <I extends z.ZodTypeAny>(input: I): ZodTransformer<I, I> => {
    return new ZodTransformer({
      t: z.ZodTypes.transformer,
      input,
      output: input,
      transformer: x => x,
    });
  };
}
