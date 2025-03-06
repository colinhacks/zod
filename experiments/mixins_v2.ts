class Base {
  type: string;
}
class ChildA extends Base {
  type: "a";
}
class ChildB extends Base {
  type: "b";
}

interface Mixin extends Base {
  getType(): this["type"];
}

interface AugmentedChildA extends ChildA, Mixin {
  // you can resolve this error by manually specifying
  // a type signature for `type`. that's redundant and
  // not allowed!
  // type: "a";
}

declare const a: AugmentedChildA;
a.type; // => "a"
a.getType(); // => "a"

interface AugmentedChildA extends ChildA, Augmentation {}
// class AugmentedChildA extends StringSchema {
//   getType() {
//     return this.type;
//   }
// }

interface Augment<T extends Parent> extends T {
  myMethod(): this;
}

// class AugmentedChildA

interface Schema<T = unknown> {
  _output: T;
  parse(input: unknown): T;
}
interface StringSchema extends Schema<string> {}
interface AugmentedStringSchema extends AugmentSchema<StringSchema> {}
