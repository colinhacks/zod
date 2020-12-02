import * as z from '.';

(async () => {
  const asyncNumberToString = z.transformer(z.number(), z.string(), async n =>
    String(n),
  );
  z.object({
    id: asyncNumberToString,
  }).parse({ id: 5 });
})();
