import * as z from "zod3";

z;

function a() {
  b();
}

function b() {
  c();
}

function c() {
  z.string().parse(12);
}

try {
  a();
} catch (err: any) {
  console.log(err);
  console.log(err.stack);
}

// class Version<
//   T extends z.ZodType = z.ZodType,
//   Prev extends Version<any, any> | null = null, // ✅ no self‑referencing default
// > {
//   type: T;
//   prev: Prev;
//   migrate: (prev: z.output<NonNullable<Prev>["type"]>) => z.output<T>;

//   constructor(type: T, prev: Prev, migrate: (prev: z.output<NonNullable<Prev>["type"]>) => z.output<T>) {
//     this.type = type;
//     this.prev = prev;
//     this.migrate = migrate;
//   }

//   bump<U extends z.ZodType>(schema: U, migrate: (prev: z.output<T>) => z.output<U>): Version<U, this> {
//     return new Version(schema, this, migrate);
//   }

//   static initial<T extends z.ZodType>(schema: T): Version<T, null> {
//     return new Version(schema, null, () => {
//       throw new Error("initial");
//     });
//   }
// }

// const v1 = Version.initial(z.object({ a: z.string() }));

// const v2 = v1.bump(v1.type.extend({ b: z.number() }), (prev) => {
//   return {
//     ...prev,
//     b: 0,
//   };
// });
