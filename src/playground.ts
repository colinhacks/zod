import * as z from '.';

class ZodWithTransform<T extends z.ZodTypeAny> {
  schema: T;
  _transform: (arg: any) => T['_type'];

  constructor(schema: T) {
    this.schema = schema;
  }

  transform = (_transform: (data: unknown) => T['_type']) => {
    this._transform = _transform;
    return this;
  };

  parse(data: unknown) {
    return this.schema.parse(this._transform(data));
  }

  static from = <Schema extends z.ZodTypeAny>(schema: Schema): ZodWithTransform<Schema> => {
    return new ZodWithTransform(schema);
  };
}

const helloThere = ZodWithTransform.from(z.number()).transform(x => Number(x));

console.log(helloThere.parse('12'));

// const NUMBER = (Symbol.for('number') as any) as number;
// const STRING = (Symbol.for('string') as any) as string;

// type OmitByValue<T extends { [key: string]: any }, ValueType> = Pick<
//   T,
//   { [Key in keyof T]-?: T[Key] extends ValueType ? never : Key }[keyof T]
// >;

// type Infer<T> = OmitByValue<T, (...args: any[]) => any>;

// function zod<O extends { [key: string]: any }>(obj: O): O & { validate(): void } {
//   return Object.create(obj, {
//     validate: {
//       value() {
//         console.log('valireturnValuedate!');
//       },
//     },
//   });
// }

// const part = {
//   points: NUMBER,
// };

// const User = {
//   ...part,
//   name: STRING,
//   get posts() {
//     return [Post];
//   },
//   get friends() {
//     return [User];
//   },
// } as const;

// const Post = {
//   ...part,
//   content: STRING,
//   b: STRING,
//   get author() {
//     return [User];
//   },
// } as const;

// const qwer = Post.author[0].posts[1].author[0].friends[0].name;

// // const ValidateObj = zod(User);
// // const ValidatePartObj = zod(PartObj);

// // type Inferred = Infer<typeof ValidateObj>;

// // type ArrType = Inferred['name'];

// // type OneType = Inferred['posts'][number]['content'];

// // // type InferDeepType = Inferred['bs'][number]['as']['anum'];
