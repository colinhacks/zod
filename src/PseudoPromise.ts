import {
  ZodError
} from './ZodError';
type Func = (...args: any[]) => any;
type FunctionTuples = ([string, Func])[];
export class PseudoPromise<ReturnType = undefined> {
  readonly _return: ReturnType;
  functionTuples: FunctionTuples;
  constructor(funcs: FunctionTuples = []) {
    this.functionTuples = funcs;
  }

  static all = <T extends PseudoPromise<any>[]>(pps: T) => {
    return new PseudoPromise().all(pps);
  };

  all = <T extends PseudoPromise<any>[]>(
    pps: T,
  ): PseudoPromise<
    {
      [k in keyof T]: T[k] extends PseudoPromise<any> ? T[k]['_return'] : never;
    }
  > => {
    return this.then((_arg, ctx) => {
      // const results = pps.map(pp => pp.getValue());
      if (ctx.async) {
        return Promise.all(pps.map(pp => pp.getValueAsync()));
      } else {
        return pps.map(pp => pp.getValueSync()) as any;
      }
    });
  };

  // subpromise = <T extends PseudoPromise<any>>(subprom:T)=>{
  //   return this.then((arg,ctx)=>{
  //     const subval = subprom.
  //   })
  // }

  // static allAsync = (pps:all PseudoPromise<any>[]) => {
  //   return PseudoPromise.resolve(Promise.all(pps.map(pp => pp.toPromise())));
  // };

  static object = (pps: { [k: string]: PseudoPromise<any> }) => {
    return new PseudoPromise().then((_arg, ctx) => {
      const value: any = {};
      // const items = Object.keys(pps).map(k => {
      //   const v = pps[k].getValue();
      //   return [k, v] as [string, any];
      // });

      // let isAsync = ctx.async; //items.some(item => item[1] instanceof Promise);
      // Object.keys(pps).some(
      //   k => pps[k].getValue() instanceof Promise,
      // );
      //
      if (ctx.async) {
        const getAsyncObject = async () => {
          // const promises = Object.keys(pps).map(async k => {
          //   const v = await pps[k].getValue();
          //   return [k, v] as [string, any];
          // });
          // const items = await Promise.all(promises);
          // const asyncValue: any = {};
          const items = await Promise.all(
            Object.keys(pps).map(async k => {
              // try {
                const x = pps[k].getValueAsync();
                const v = await x;
                return [k, v] as [string, any];
            }),
          );
          // const resolvedItems = await Promise.all(
          //   items.map(async item => [item[0], await item[1]]),
          // );

          for (const item of items) {
            value[item[0]] = item[1];
          }

          return value;
        };
        return getAsyncObject();
      } else {
        const items = Object.keys(pps).map(k => {
          const v = pps[k].getValueSync();
          return [k, v] as [string, any];
        });
        // let syncValue: any = {};
        for (const item of items) {
          value[item[0]] = item[1];
        }
        return value;
      }
    });
  };

  static resolve = <T>(value: T): PseudoPromise<T> => {
    if (value instanceof PseudoPromise) {
      throw new Error('Do not pass PseudoPromise into PseudoPromise.resolve');
    }
    return new PseudoPromise().then(() => value) as any;
  };

  then = <NewReturn>(
    func: (arg: ReturnType, ctx: { async: boolean }) => NewReturn,
  ): PseudoPromise<NewReturn extends Promise<infer U> ? U : NewReturn> => {
    return new PseudoPromise([...this.functionTuples, ['t', func]]);
  };

  catch = <NewReturn>(
    func: (err: ZodError | any, ctx: { async: boolean }) => NewReturn,
  ): PseudoPromise<NewReturn extends Promise<infer U> ? U : NewReturn> => {
    return new PseudoPromise([...this.functionTuples, ['c', func]]);
  };

  // getValue = (
  //   allowPromises: boolean = false,
  // ): ReturnType | Promise<ReturnType> => {
  //   try {
  //     return this.getValueSync(allowPromises);
  //   } catch (err) {
  //     if (err.message === 'found_promise') {
  //       return this.getValueAsync();
  //     }
  //     throw err;
  //   }
  // };

  getValueSync = () => {
    // // if (this._cached.value) return this._cached.value;
    let val: any = undefined;

    for (const [t, f] of this.functionTuples) {
      if (t === 't') {
        val = f(val, { async: false });
      }

      // if (val instanceof Promise && allowPromises === false) {
      //   throw new Error('found_promise');
      // }
    }
    // this._cached.value = val;
    return val;
  };

  getValueAsync: Function = async (that: PseudoPromise<any> = this) => {
    // // if (this._cached.value) return this._cached.value;
    let val: any = undefined;
    
    for (let index = 0; index < that.functionTuples.length; index++) {
      const [t, f] = that.functionTuples[index];
      try {
        if (t === 't') {
          val = await f(val, { async: true }); 
        }
      } catch (err) {
        const cIndex = that.functionTuples.findIndex((x, i) => x[0] === 'c' && i > index);

        if (cIndex > -1) {
          val = await that.functionTuples[cIndex][1](err);
          index = cIndex;
        } else {
          throw err;
        }
      }

      if (val instanceof PseudoPromise) {
        throw new Error('DO NOT RETURN PSEUDOPROMISE FROM FUNCTIONS');
      }
      if (val instanceof Promise) {
        throw new Error('DO NOT RETURN PROMISE FROM FUNCTIONS');
      }
      // while (!!val.then) {
      //   if (val instanceof PseudoPromise) {
      //     val = await val.toPromise();
      //   } else {
      //     val = await val;
      //   }
      // }
    }
    // this._cached.value = val;
    return val;
  };
}
