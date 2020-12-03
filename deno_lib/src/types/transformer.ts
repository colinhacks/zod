import * as z from './base.ts';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

export interface ZodTransformerDef<
  T extends z.ZodTypeAny = z.ZodTypeAny,
  U extends z.ZodTypeAny = z.ZodTypeAny
> extends z.ZodTypeDef {
  t: z.ZodTypes.transformer;
  input: T;
  output: U;
  transformer: (arg: T['_output']) => U['_input'];
}

export class ZodTransformer<
  T extends z.ZodTypeAny,
  U extends z.ZodTypeAny
> extends z.ZodType<U['_output'], ZodTransformerDef<T, U>, T['_input']> {
  // readonly _input!: T['_input'];
  // readonly _output!: U['_output'];
  // opt optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);
  // null nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);
  // inputSchema():T{
  //   return this._def.input;
  // }

  // get output() {
  //   return this._def.output;
  // }
  // set inputSchema(val) {
  //   val;
  // }
  // get inputSchema() {
  //   return this._def.output;
  // }
  // set outputSchema(val) {
  //   val;
  // }
  // get outputSchema() {
  //   return this._def.output;
  // }

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

  get output() {
    return this._def.output;
  }

  static create = <I extends z.ZodTypeAny, O extends z.ZodTypeAny>(
    input: I,
    output: O,
    transformer: (arg: I['_output']) => O['_input'] | Promise<O['_input']>,
  ): ZodTransformer<I, O> => {
    return new ZodTransformer({
      t: z.ZodTypes.transformer,
      input,
      output,
      transformer,
    });
  };

  static fromSchema = <I extends z.ZodTypeAny>(
    input: I,
  ): ZodTransformer<I, I> => {
    return new ZodTransformer({
      t: z.ZodTypes.transformer,
      input,
      output: input,
      transformer: x => x,
    });
  };
}
