import * as z from './base';

export interface ZodUndefinedDef extends z.ZodTypeDef {
  t: z.ZodTypes.undefined;
}

export class ZodUndefined extends z.ZodType<undefined> {
  toJSON = () => this._def;

  static create = (): ZodUndefined => {
    return new ZodUndefined({
      t: z.ZodTypes.undefined,
    });
  };
}
