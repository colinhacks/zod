export namespace util {
  export type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : false) : false;

  // export type ObjectsEqual<X extends object, Y extends object> = AssertEqual<X, Y> extends true
  //   ? 'bad' extends { [k in keyof X & keyof Y]: AssertEqual<X[k], Y[k]> extends true ? 'good' : 'bad' }[keyof X &
  //       keyof Y]
  //     ? { [k in keyof X & keyof Y]: AssertEqual<X[k], Y[k]> extends true ? 'good' : 'bad' }
  //     : true
  //   : false;

  export function assertNever(_x: never): never {
    throw new Error();
  }

  export const getObjectType = (value: unknown): string | undefined => {
    const objectName = toString.call(value).slice(8, -1);
    if (objectName) {
      return objectName;
    }

    return undefined;
  };

  export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
  export type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;

  // const infer = <T extends string, U extends [T, ...T[]]>(items: U): U => {
  //   return items;
  // };

  export const arrayToEnum = <T extends string, U extends [T, ...T[]]>(items: U): { [k in U[number]]: k } => {
    const obj: any = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj as any;
  };
}
