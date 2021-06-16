import { INVALID } from "./helpers/parseUtil";
import { ZodError } from "./ZodError";

type Func = (arg: any, ctx: { async: boolean }) => any;
type FuncItem = { type: "function"; function: Func };
type Catcher = (error: Error, ctx: { async: boolean }) => any;
type CatcherItem = { type: "catcher"; catcher: Catcher };
type Items = (FuncItem | CatcherItem)[];

export const NOSET = Object.freeze({ no_set: true });

export class PseudoPromise<PayloadType = undefined> {
  readonly _return: PayloadType | undefined;
  items: Items;
  constructor(funcs: Items = []) {
    this.items = funcs;
  }

  static all = <T extends [PseudoPromise<any>, ...PseudoPromise<any>[]]>(
    pps: T
  ) => {
    return new PseudoPromise().all(() => pps);
  };

  all = <P extends PseudoPromise<any>, T extends [P, ...P[]]>(
    func: (arg: PayloadType, ctx: { async: boolean }) => T
  ): PseudoPromise<
    {
      [k in keyof T]: T[k] extends PseudoPromise<infer U> ? U : never;
    }
  > => {
    return this.then((arg, ctx) => {
      const pps = func(arg, ctx);
      if (ctx.async) {
        const allValues = Promise.all(
          pps.map(async (pp) => {
            try {
              return await pp.getValueAsync();
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

      const zerr = new ZodError([]);
      if (ctx.async) {
        const getAsyncObject = async () => {
          const items = await Promise.all(
            Object.keys(pps).map(async (k) => {
              try {
                const v = await pps[k].getValueAsync();
                return [k, v] as [string, any];
              } catch (err) {
                if (err instanceof ZodError) {
                  zerr.addIssues(err.issues);
                  return [k, INVALID] as [string, any];
                }
                throw err;
              }
            })
          );

          if (!zerr.isEmpty) throw zerr;

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
              zerr.addIssues(err.issues);
              return [k, INVALID] as [string, any];
            }
            throw err;
          }
        });
        if (!zerr.isEmpty) throw zerr;
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

  then = <NewPayload>(
    func: (arg: PayloadType, ctx: { async: boolean }) => NewPayload
  ): PseudoPromise<NewPayload extends Promise<infer U> ? U : NewPayload> => {
    return new PseudoPromise([
      ...this.items,
      { type: "function", function: func },
    ]);
  };

  // parallel = <
  //   NewFunc extends (arg: PayloadType, ctx: { async: boolean }) => any,
  //   ParallelArgs extends [NewFunc, ...NewFunc[]]
  // >(
  //   ...funcs: ParallelArgs
  // ): PseudoPromise<
  //   {
  //     [k in keyof ParallelArgs]: ParallelArgs[k] extends (
  //       ...args: any
  //     ) => infer R
  //       ? R extends Promise<infer U>
  //         ? U
  //         : R
  //       : never;
  //   }
  // > => {
  //   return new PseudoPromise([
  //     ...this.items,
  //     { type: "function", function: func },
  //   ]);
  // };

  catch = (catcher: (err: Error, ctx: { async: boolean }) => unknown): this => {
    return new PseudoPromise([
      ...this.items,
      { type: "catcher", catcher },
    ]) as this;
  };

  getValueSync = (): PayloadType => {
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

  getValueAsync = async (): Promise<PayloadType> => {
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
