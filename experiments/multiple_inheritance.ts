class A {
  a: string;
  constructor() {
    this.a = "a";
  }
}

class B {
  b: string;
}

type ClassType = { prototype: any; new (...args: string[]): any };
function merge<A extends ClassType, B extends ClassType>(
  a: A,
  b: B
): {
  new (def: ConstructorParameters<A>[0] & ConstructorParameters<B>[0]): A["prototype"] & B["prototype"];
} {
  return class {
    constructor(def: any) {
      a.constructor.call(this, def);
      b.constructor.call(this, def);
    }
  };
}

class C extends merge(A, B) {
  c: string;
}

declare const ccc: C;
