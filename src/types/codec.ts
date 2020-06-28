// import * as z from './base';
// import { ZodUndefined } from './undefined';
// import { ZodNull } from './null';
// import { ZodUnion } from './union';

// type Transformer<T extends z.ZodTypeAny, U extends z.ZodTypeAny> = (arg: T['_type']) => U['_type'];

// export interface ZodCodecDef<T extends z.ZodTypeAny = z.ZodTypeAny, U extends z.ZodTypeAny = z.ZodTypeAny>
//   extends z.ZodTypeDef {
//   t: z.ZodTypes.codec;
//   input: T;
//   output: U;
//   transformer: Transformer<T, U>;
// }

// export class ZodCodec<T extends z.ZodTypeAny, U extends z.ZodTypeAny> extends z.ZodType<U['_type'], ZodCodecDef<T, U>> {
//   optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

//   nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

//   toJSON = () => ({
//     t: this._def.t,
//     input: this._def.input.toJSON(),
//     output: this._def.output.toJSON(),
//   });

//   static create = <T extends z.ZodTypeAny, U extends z.ZodTypeAny>(
//     input: T,
//     output: U,
//     transformer: Transformer<T, U>,
//   ): ZodCodec<T, U> => {
//     return new ZodCodec({
//       t: z.ZodTypes.codec,
//       input: input,
//       output: output,
//       transformer,
//     });
//   };
// }
