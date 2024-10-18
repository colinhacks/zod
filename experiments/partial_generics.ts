export const _Dynamic = class {
  constructor(properties: object) {
    Object.assign(this, properties);
  }
} as new <T extends object>(
  base: T
) => T;

/** @ts-expect-error (needed to extend `t`, but safe given ShallowClone's implementation) **/
export class Dynamic<T extends object> extends _Dynamic<T> {}

interface Def {
  a: unknown;
  b: unknown;
  c: unknown;
}

interface DefDefaults extends Def {
  a: string;
  b: number;
  c: boolean;
}

type MergeDef<A extends Def, B extends Partial<Def>> = {
  [k in keyof Def]: k extends keyof B ? B[k] : A[k];
};

// type Intersect<A, B> = A & {};
interface Base<T> extends Dynamic<T> {}
class Base<T extends Def = DefDefaults> {}
class A<T extends Partial<Def> = {}> extends Base<MergeDef<DefDefaults, T>> {}

type adslfkj = "asdf" extends object ? true : false;

type CurlyAny = {};
type Empty = { [key: string]: never };
type EmptyRecord = Record<never, never>;
interface EmptyInterface {}

const a1: CurlyAny = {};
const a2: EmptyRecord = {};
const a3: EmptyInterface = {};

const b1: Empty = { name: "colin" };
const b2: EmptyRecord = { name: "colin" };
const b3: EmptyInterface = { name: "colin" };

const c1: { name: string } = { name: "colin", age: 324 };

declare const a: A<{ b: string[] }>;
a.b;
