// import * as z from '.';
// const lit = {
//   Alpha: 'a',
//   Beta: 'b',
// } as const;

// const keys = Object.values(lit);
// const asdf =z.nativeEnum(lit);
// type asdf = z.infer<typeof asdf>

enum Fruits {
  Cantaloupe,
  Apple = 'apple',
  Banana = 'banana',
}

console.log(Fruits);

const filtered = (obj: any) => {
  const validKeys = Object.keys(obj).filter((k: any) => typeof obj[obj[k]] !== 'number');
  const filtered: any = {};
  for (const k of validKeys) {
    filtered[k] = obj[k];
  }
  return filtered;
};
console.log(filtered(Fruits));

// type AcceptedValues = 1|2|3|4|5|6|7|8|9|10|11|12;
// type AcceptedValues = 1|2|3|4|5|6|7|8|9|10|11|12;
// const mynumber:z.Schema<AcceptedValues> = z.number().min(1).max(12) as any;
// const qer = mynumber.parse(5); // type: AcceptedValues

// z.object({ message: 'Gimme object!' });
