import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';

export interface ZodStringDef extends z.ZodTypeDef {
  t: z.ZodTypes.string;
  validation: {
    uuid?: true;
    custom?: ((val: any) => boolean)[];
  };
}

export class ZodString extends z.ZodType<string, ZodStringDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;

  // validate = <Val extends (arg:this['_type'])=>boolean>(check:Val)=>{
  //   const currChecks = this._def.validation.custom || [];
  //   return new ZodString({
  //     ...this._def,
  //     validation: {
  //       ...this._def.validation,
  //       custom: [...currChecks, check],
  //     },
  //   });
  // }

  static create = (): ZodString => {
    return new ZodString({
      t: z.ZodTypes.string,
      validation: {},
    });
  };
}
