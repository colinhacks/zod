export namespace util {
  export type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : false) : false;

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

  export const arrayToEnum = <T extends string, U extends [T, ...T[]]>(items: U): { [k in U[number]]: k } => {
    const obj: any = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj as any;
  };
}
