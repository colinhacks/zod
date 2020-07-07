import { ZodParser, ParseParams } from '../parser';

export enum ZodTypes {
  string = 'string',
  number = 'number',
  bigint = 'bigint',
  boolean = 'boolean',
  date = 'date',
  undefined = 'undefined',
  null = 'null',
  array = 'array',
  object = 'object',
  // interface = 'interface',
  union = 'union',
  intersection = 'intersection',
  tuple = 'tuple',
  record = 'record',
  function = 'function',
  lazy = 'lazy',
  lazyobject = 'lazyobject',
  literal = 'literal',
  enum = 'enum',
  promise = 'promise',
  any = 'any',
  unknown = 'unknown',
  void = 'void',
}

export type ZodTypeAny = ZodType<any>;
export type ZodRawShape = { [k: string]: ZodTypeAny };

// const asdf = { asdf: ZodString.create() };
// type tset1 = typeof asdf extends ZodRawShape ? true :false

type Check<T> = {
  check: (arg: T) => any;
  message?: string;
  params?: { [k: string]: any };
  // code: string
};
export interface ZodTypeDef {
  t: ZodTypes;
  checks?: Check<any>[];
}

export type TypeOf<T extends { _type: any }> = T['_type'];
export type Infer<T extends { _type: any }> = T['_type'];

//   interface Assertable<T> {
//     is(value: any): value is T;
//     assert(value: any): asserts value is T;
// }

export abstract class ZodType<Type, Def extends ZodTypeDef = ZodTypeDef> {
  readonly _type!: Type;
  readonly _def!: Def;

  // get subclass() {
  //   console.log(this.constructor);
  //   return this.constructor;
  // }

  parse: (x: Type | unknown, params?: ParseParams) => Type;

  is(u: Type): u is Type {
    try {
      this.parse(u as any);
      return true;
    } catch (err) {
      return false;
    }
  }

  check(u: Type | unknown): u is Type {
    try {
      this.parse(u as any);
      return true;
    } catch (err) {
      return false;
    }
  }

  refine = <Val extends (arg: Type) => any>(check: Val, message: string = 'Invalid value.') => {
    // const newChecks = [...this._def.checks || [], { check, message }];
    // console.log((this as any).constructor);
    return new (this as any).constructor({
      ...this._def,
      checks: [...(this._def.checks || []), { check, message }],
    }) as this;
    // return this;
  };

  refinement = (refinement: Check<Type>) => {
    // const finalRefinement = {
    //   check: refinement.check,

    // code: refinement.code || 'custom-refinement-failed',
    //   message: refinement.message,
    // };
    // const newChecks = [...this._def.checks || [], { check, message }];
    // console.log((this as any).constructor);
    return new (this as any).constructor({
      ...this._def,
      checks: [...(this._def.checks || []), refinement],
    }) as this;
    // return this;
  };

  // mask = <P extends maskUtil.Params<Type>>(_params: P): ZodType<maskUtil.Pick<Type, P>> => {
  //   return Masker(this, _params) as any;
  // };

  // pick = <Params extends maskUtil.Params<Type>>(_params: Params): maskUtil.Mask<Type, Params> => {
  //   return 'asdf' as any;
  // };

  //  Wrapper = class<Type, Schema> {
  //    value: Type;
  //    schema: Schema;
  //    constructor(schema: Schema, value: Type) {
  //      this.value = value;
  //      this.schema = schema;
  //    }
  //  };

  //  wrap: (value: this['_type'], params?: ParseParams) => any = (value, params) => {
  //    const parsed = this.parse(value, params);
  //    return new this.Wrapper<this['_type'], this>(this, parsed);
  //   //  return new  ZodValue(this, this.parse(value, params));
  //  };

  // wrap: (value: Type, params?: ParseParams) => ZodWrapped<this> = (value, params) => {
  //   const parsed = this.parse(value, params);
  //   return new ZodWrapped(this, parsed);
  //   //  return new  ZodValue(this, this.parse(value, params));
  // };

  constructor(def: Def) {
    this.parse = ZodParser(def);
    this._def = def;
  }

  abstract toJSON: () => object;
  abstract optional: () => any;
  abstract nullable: () => any;
}

// export class ZodWrapped<T extends ZodType<any, any>> {
//   value: T['_type'];
//   schema: T;
//   constructor(schema: T, value: T['_type']) {
//     this.schema = schema;
//     this.value = value;
//   }

//   //  toJSON =()=>this.toJSON();
// }
