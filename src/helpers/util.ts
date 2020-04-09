export namespace util {
  export type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : never) : never;

  export function assertNever(_x: never): never {
    throw new Error();
  }
}
