import { ZodType, ZodTypes, ZodTypeDef } from '../internal';

export interface ZodNeverDef extends ZodTypeDef {
  t: ZodTypes.never;
}

export class ZodNever extends ZodType<never, ZodNeverDef> {
  toJSON = () => this._def;

  static create = (): ZodNever => {
    return new ZodNever({
      t: ZodTypes.never,
    });
  };
}
