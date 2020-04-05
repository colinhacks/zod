export namespace util {
  export type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : never) : never;
}
