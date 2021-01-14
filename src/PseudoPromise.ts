import { INVALID } from "./helpers/util";
import { ZodError, ZodIssue } from "./ZodError";

type Func = (arg: any, ctx: { async: boolean }) => any;
type FuncItem = { type: "function"; function: Func };
type Catcher = (error: Error, ctx: { async: boolean }) => any;
type CatcherItem = { type: "catcher"; catcher: Catcher };
type Items = (FuncItem | CatcherItem)[];

export const NOSET = Symbol("no_set");
export class PseudoPromise<ReturnType = undefined> {
  readonly _return: ReturnType;
  items: Items;
  constructor(funcs: Items = []) {
    this.items = funcs;
  }

  static all = <T extends PseudoPromise<any>[]>(pps: T) => {
    return new PseudoPromise().all(pps);
  };

  all = <T extends PseudoPromise<any>[]>(
    pps: T
  ): PseudoPromise<
    {
      [k in keyof T]: T[k] extends PseudoPromise<any> ? T[k]["_return"] : never;
    }
  > => {
    return this.then((_arg, ctx) => {
      if (ctx.async) {
        const allValues = Promise.all(
          pps.map(async (pp) => {
            try {
              const asdf = await pp.getValueAsync();
              return asdf;
            } catch (err) {
              return INVALID;
            }
          })
        ).then((vals) => {
          return vals;
        });
        return allValues;
      } else {
        return pps.map((pp) => pp.getValueSync()) as any;
      }
    });
  };

  static object = (pps: { [k: string]: PseudoPromise<any> }) => {
    return new PseudoPromise().then((_arg, ctx) => {
      const value: any = {};

      const issues: ZodIssue[] = [];
      if (ctx.async) {
        const getAsyncObject = async () => {
          const items = await Promise.all(
            Object.keys(pps).map(async (k) => {
              try {
                const v = await pps[k].getValueAsync();
                return [k, v] as [string, any];
              } catch (err) {
                if (err instanceof ZodError) {
                  issues.push(...err.issues);
                  return [k, INVALID] as [string, any];
                }
                throw err;
              }
            })
          );

          if (issues.length !== 0) throw new ZodError(issues);

          for (const item of items) {
            if (item[1] !== NOSET) value[item[0]] = item[1];
          }

          return value;
        };
        return getAsyncObject();
      } else {
        const items = Object.keys(pps).map((k) => {
          try {
            const v = pps[k].getValueSync();
            return [k, v] as [string, any];
          } catch (err) {
            if (err instanceof ZodError) {
              issues.push(...err.issues);
              return [k, INVALID] as [string, any];
            }
            throw err;
          }
        });
        if (issues.length !== 0) throw new ZodError(issues);
        for (const item of items) {
          if (item[1] !== NOSET) value[item[0]] = item[1];
        }
        return value;
      }
    });
  };

  static resolve = <T>(value: T): PseudoPromise<T> => {
    if (value instanceof PseudoPromise) {
      throw new Error("Do not pass PseudoPromise into PseudoPromise.resolve");
    }
    return new PseudoPromise().then(() => value) as any;
  };

  then = <NewReturn>(
    func: (arg: ReturnType, ctx: { async: boolean }) => NewReturn
  ): PseudoPromise<NewReturn extends Promise<infer U> ? U : NewReturn> => {
    return new PseudoPromise([
      ...this.items,
      { type: "function", function: func },
    ]);
  };

  catch = (catcher: (err: Error, ctx: { async: boolean }) => unknown): this => {
    return new PseudoPromise([
      ...this.items,
      { type: "catcher", catcher },
    ]) as this;
  };

  getValueSync = (): ReturnType => {
    let val: any = undefined;

    for (let index = 0; index < this.items.length; index++) {
      try {
        const item = this.items[index];

        if (item.type === "function") {
          val = item.function(val, { async: false });
        }
      } catch (err) {
        const catcherIndex = this.items.findIndex(
          (x, i) => x.type === "catcher" && i > index
        );

        const catcherItem = this.items[catcherIndex];
        if (!catcherItem || catcherItem.type !== "catcher") {
          throw err;
        } else {
          index = catcherIndex;
          val = catcherItem.catcher(err, { async: false });
        }
      }
    }

    return val;
  };

  getValueAsync = async (): Promise<ReturnType> => {
    let val: any = undefined;

    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index];
      try {
        if (item.type === "function") {
          val = await item.function(val, { async: true });
        }
      } catch (err) {
        const catcherIndex = this.items.findIndex(
          (x, i) => x.type === "catcher" && i > index
        );

        const catcherItem = this.items[catcherIndex];

        if (!catcherItem || catcherItem.type !== "catcher") {
          throw err;
        } else {
          index = catcherIndex;
          val = await catcherItem.catcher(err, { async: true });
        }
      }

      if (val instanceof PseudoPromise) {
        throw new Error("ASYNC: DO NOT RETURN PSEUDOPROMISE FROM FUNCTIONS");
      }
      if (val instanceof Promise) {
        throw new Error("ASYNC: DO NOT RETURN PROMISE FROM FUNCTIONS");
      }
    }
    return val;
  };
}
