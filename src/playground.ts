const partial = <P extends { deep: boolean }>(params?: P): P => {
  return params || ({ deep: true } as any);
};

const qwer = partial();
