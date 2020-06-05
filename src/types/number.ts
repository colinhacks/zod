import * as z from './base';
import { ZodUndefined } from './undefined';
import { ZodNull } from './null';
import { ZodUnion } from './union';

export interface ZodNumberDef extends z.ZodTypeDef {
  t: z.ZodTypes.number;
}

export class ZodNumber extends z.ZodType<number, ZodNumberDef> {
  optional: () => ZodUnion<[this, ZodUndefined]> = () => ZodUnion.create([this, ZodUndefined.create()]);

  nullable: () => ZodUnion<[this, ZodNull]> = () => ZodUnion.create([this, ZodNull.create()]);

  toJSON = () => this._def;
  static create = (): ZodNumber => {
    return new ZodNumber({
      t: z.ZodTypes.number,
    });
  };

  min = (minimum: number, msg?: string) => this.refine(data => data >= minimum, msg || `Value must be >= ${minimum}`);

  max = (maximum: number, msg?: string) => this.refine(data => data <= maximum, msg || `Value must be <= ${maximum}`);

  int = (msg?: string) => this.refine(data => Number.isInteger(data), msg || 'Value must be an integer.');

  positive = (msg?: string) => this.refine(data => data > 0, msg || `Value must be positive`);

  negative = (msg?: string) => this.refine(data => data < 0, msg || `Value must be negative`);

  nonpositive = (msg?: string) => this.refine(data => data <= 0, msg || `Value must be non-positive`);

  nonnegative = (msg?: string) => this.refine(data => data >= 0, msg || `Value must be non-negative`);
}
