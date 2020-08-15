type Func = (...args: any[]) => any;
type Functions = Func[];
export class PseudoPromise<ReturnType = undefined> {
  readonly _return: ReturnType;
  functions: Functions;
  constructor(funcs: Functions = []) {
    this.functions = funcs;
  }

  static all = <T extends PseudoPromise<any>[]>(
    pps: PseudoPromise<any>[],
  ): PseudoPromise<{ [k in keyof T]: T[k] extends PseudoPromise<any> ? T[k]['_return'] : never }> => {
    try {
      const result = pps.map(pp => pp.toValue());
      return PseudoPromise.resolve(result) as any;
    } catch (err) {
      return PseudoPromise.resolve(Promise.all(pps.map(pp => pp.toValue()))) as any;
    }
  };

  // static allAsync = (pps:all PseudoPromise<any>[]) => {
  //   return PseudoPromise.resolve(Promise.all(pps.map(pp => pp.toPromise())));
  // };

  static object = (pps: { [k: string]: PseudoPromise<any> }) => {
    console.log(`PseudoPromise.object`);
    console.log(pps);

    //  for (const pp of Object.values(pps)) {
    //    pp.toValue().then(console.log);
    //    console.log(pp.functions[0]);
    //  }
    try {
      let syncValue: any = {};
      for (const k in pps) {
        syncValue[k] = pps[k].toValue();
      }
      return PseudoPromise.resolve(syncValue);
    } catch (err) {
      if (err.message === 'found_promise') {
        // const obj: any = {};
        // console.log('ASYBCN');
        // console.log(pps);
        // const allPromise = Promise.all(
        //   Object.entries(pps).map(async x => {
        //     const val = await x[1].toPromise();
        //     console.log('VAL');
        //     console.log(val);
        //     obj[x[0]] = val;
        //     console.log(`${x[0]}: ${val}`);
        //     return obj;
        //   }),
        // ).then(() => obj);
        return PseudoPromise.resolve(
          new Promise(async res => {
            const obj: any = {};
            for (const key in pps) {
              const val = await pps[key].toValue();
              console.log(`${key}: ${val}`);
              console.log(JSON.stringify(obj, null, 2));
              obj[key] = val;
            }
            res(obj);
          }),
        );
      }
      throw err;
    }
  };

  static resolve = <T>(value: T): PseudoPromise<T> => {
    if (value instanceof PseudoPromise) {
      return value; //new PseudoPromise().then(() => value.toValue(true));
    }
    return new PseudoPromise().then(() => value) as any;
  };

  then = <NewReturn>(
    func: (...args: [ReturnType]) => NewReturn,
  ): PseudoPromise<NewReturn extends Promise<infer U> ? U : NewReturn> => {
    return new PseudoPromise([...this.functions, func]);
  };

  toValue = (): ReturnType | Promise<ReturnType> => {
    try {
      let val: any = undefined;
      for (const f of this.functions) {
        val = f(val);
        if (val && val.then) {
          throw new Error('found_promise');
        }
      }
      return val;
    } catch (err) {
      if (err.message === 'found_promise') {
        return this._toPromise();
      }
      throw err;
    }
  };

  _toPromise = async () => {
    let val: any = undefined;
    console.log(`\nTOPROMISE`);
    console.log(`funcs: ${this.functions.length}`);
    for (const f of this.functions) {
      val = await f(val);

      console.log(`func #${this.functions.indexOf(f) + 1}`);
      console.log(`val: ${val}`);
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

    console.log(`finalVal toPromise: ${val}`);

    return val;
  };
}
