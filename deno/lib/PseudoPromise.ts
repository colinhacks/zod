export class PseudoPromise<PayloadType = undefined> {
  readonly promise: Promise<PayloadType>;

  constructor(promise: Promise<PayloadType>) {
    this.promise = promise;
  }

  then<MappedType>(
    f: (_v: PayloadType) => MappedType
  ): PseudoPromise<MappedType> {
    return new PseudoPromise<MappedType>(this.promise.then(f));
  }

  static all = <T extends (any | PseudoPromise<any>)[]>(
    pps: T
  ): PseudoPromise<
    { [K in keyof T]: T[K] extends PseudoPromise<infer I> ? I : T[K] }
  > => {
    return new PseudoPromise(
      Promise.all(pps.map((v) => (v instanceof PseudoPromise ? v.promise : v)))
    ) as any;
  };
}
