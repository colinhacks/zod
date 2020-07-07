export type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : false) : false;

// export type ObjectsEqual<X extends object, Y extends object> = AssertEqual<X, Y> extends true
//   ? 'bad' extends { [k in keyof X & keyof Y]: AssertEqual<X[k], Y[k]> extends true ? 'good' : 'bad' }[keyof X &
//       keyof Y]
//     ? { [k in keyof X & keyof Y]: AssertEqual<X[k], Y[k]> extends true ? 'good' : 'bad' }
//     : true
//   : false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertNever(_: never): never {
  throw new Error();
}

export const getObjectType = (value: unknown): string | undefined => {
  const objectName = `${value}`.slice(8, -1);
  if (objectName) {
    return objectName;
  }

  return undefined;
};
