interface $Virtuals<O, I> {
  _output: O;
  _input: I;
}

interface Dynamic<T extends object> extends T {}
interface ZodBaseType<T extends $Virtuals<unknown, unknown>>
  extends Dynamic<T> {}
interface ZodString<
  T extends $Virtuals<string, unknown> = $Virtuals<string, unknown>,
> extends ZodBaseType<T> {}
declare const arg: ZodString<{ _output: string; _input: string }>;
arg._output;

// type Brand<T extends string> = T & { __tag: true };
// function brand<T extends string>(value: T): Brand<T> {
//   return value as Brand<T>;
// }
