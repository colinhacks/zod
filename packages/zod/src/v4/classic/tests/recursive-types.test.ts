import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod/v4";

test("deferred projections preserve unions and top and bottom types", () => {
  type Mixed = z.ZodPipe<z.ZodString, z.ZodNumber> | z.ZodBoolean;
  expectTypeOf<z.input<z.ZodNullable<Mixed>>>().toEqualTypeOf<string | boolean | null>();
  expectTypeOf<z.output<z.ZodNullable<Mixed>>>().toEqualTypeOf<number | boolean | null>();
  expectTypeOf<z.input<z.ZodNullable<z.ZodUnknown | z.ZodString>>>().toBeUnknown();
  expectTypeOf<z.output<z.ZodNullable<z.ZodUnknown | z.ZodString>>>().toBeUnknown();
  expectTypeOf<z.input<z.ZodNullable<z.ZodAny | z.ZodString>>>().toBeAny();
  expectTypeOf<z.output<z.ZodNullable<z.ZodAny | z.ZodString>>>().toBeAny();
  expectTypeOf<z.input<z.ZodNullable<never>>>().toEqualTypeOf<null>();
  expectTypeOf<z.output<z.ZodNullable<never>>>().toEqualTypeOf<null>();
  expectTypeOf<z.input<z.ZodPipe<never, never>>>().toBeNever();
  expectTypeOf<z.output<z.ZodPipe<never, never>>>().toBeNever();
});

test("shallow schema references retain strict factory constraints", () => {
  function reference<T extends z.core.$ZodTypeRef>(schema: T): T {
    return schema;
  }
  const schema = reference(z.string());
  expectTypeOf(schema).toEqualTypeOf<z.ZodString>();
  expect(z.array(schema).parse(["leaf"])).toEqual(["leaf"]);

  function negative(ref: z.core.$ZodTypeRef, shape: { _zod: { def: { type: "string" } } }) {
    expectTypeOf<z.ZodArray<typeof shape>["element"]>().toEqualTypeOf<typeof shape>();
    // @ts-expect-error a schema description is not an executable schema
    const executable: z.core.SomeType = shape;
    // @ts-expect-error factories still require executable schema internals
    z.array(shape);
    // @ts-expect-error a schema reference does not declare parse methods
    ref.parse("leaf");
    void executable;
  }
  void negative;
});

test("recursive native containers preserve brands", () => {
  type Field = z.ZodString | z.ZodArray<Field>;
  const field: z.ZodArray<Field> = z.array(z.string());
  const output = field.brand<"output">();
  const input = field.brand<"input", "in">();
  const both = field.brand<"both", "inout">();
  const nested = z.array(output);
  const nestedInput = z.array(input);
  const nestedBoth = z.tuple([both]);
  const twice = z.array(output.brand<"second">());
  expectTypeOf<z.output<typeof nested>[number]>().toEqualTypeOf<z.output<typeof output>>();
  expectTypeOf<z.input<typeof nested>[number]>().toEqualTypeOf<z.input<typeof field>>();
  expectTypeOf<z.input<typeof nestedInput>[number]>().toEqualTypeOf<z.input<typeof input>>();
  expectTypeOf<z.output<typeof nestedInput>[number]>().toEqualTypeOf<z.output<typeof field>>();
  expectTypeOf<z.input<typeof nestedBoth>[0]>().toEqualTypeOf<z.input<typeof both>>();
  expectTypeOf<z.output<typeof nestedBoth>[0]>().toEqualTypeOf<z.output<typeof both>>();
  expectTypeOf<z.output<typeof twice>[number]>().toEqualTypeOf<
    z.output<typeof field> & z.core.$brand<"output"> & z.core.$brand<"second">
  >();
  type TupleField = z.ZodString | z.ZodTuple<[TupleField], null>;
  const tuple: z.ZodTuple<[TupleField], null> = z.tuple([z.string()]);
  const brandedTuple = tuple.brand<"tuple">();
  const nestedTuple = z.array(brandedTuple);
  expectTypeOf<z.output<typeof nestedTuple>[number]>().toEqualTypeOf<z.output<typeof brandedTuple>>();
  // @ts-expect-error recursive array output retains its brand
  const invalidOutput: z.output<typeof nested> = [["unbranded"]];
  // @ts-expect-error recursive array input retains its brand
  const invalidInput: z.input<typeof nestedInput> = [["unbranded"]];
  // @ts-expect-error recursive tuple output retains its brand
  const invalidTuple: z.output<typeof nestedTuple> = [["unbranded"]];
  void [invalidOutput, invalidInput, invalidTuple];
  expect(nested.parse([["leaf"]])).toEqual([["leaf"]]);
});

test("recursive native containers preserve predicate narrowing", () => {
  type Field = z.ZodString | z.ZodArray<Field>;
  const field: z.ZodArray<Field> = z.array(z.string());
  const narrowed = field.refine((value): value is string[] => value.every((item) => typeof item === "string"));
  const nested = z.array(narrowed);
  expectTypeOf<z.output<typeof nested>[number]>().toEqualTypeOf<z.output<typeof narrowed>>();
  expectTypeOf<z.input<typeof nested>[number]>().toEqualTypeOf<z.input<typeof field>>();
  type Narrow = z.core.$ZodNarrow<typeof field, string[]>;
  expectTypeOf<z.output<z.ZodArray<Narrow>>[number]>().toEqualTypeOf<z.output<Narrow>>();
  // @ts-expect-error nested arrays do not satisfy the predicate
  const invalid: z.output<typeof nested> = [[["leaf"]]];
  void invalid;
  expect(nested.parse([["leaf"]])).toEqual([["leaf"]]);
});

test("recursive schema containers retain native value types", () => {
  type ArrayField = z.ZodString | z.ZodArray<ArrayField>;
  type ArrayValue = string | ArrayValue[];
  type TupleField = z.ZodString | z.ZodTuple<[TupleField], null>;
  type TupleValue = string | [TupleValue];
  type DefaultTupleField = z.ZodString | z.ZodTuple<[DefaultTupleField]>;
  type UnionField = z.ZodUnion<[z.ZodString, UnionField]>;
  type Combined =
    | z.ZodString
    | z.ZodArray<Combined>
    | z.ZodTuple<[Combined], null>
    | z.ZodObject<{ [key: string]: Combined }>;

  expectTypeOf<z.input<ArrayField>>().toEqualTypeOf<ArrayValue>();
  expectTypeOf<z.output<ArrayField>>().toEqualTypeOf<ArrayValue>();
  expectTypeOf<z.output<TupleField>>().toEqualTypeOf<TupleValue>();
  expectTypeOf<z.input<TupleField>>().toEqualTypeOf<TupleValue>();
  expectTypeOf<UnionField["_zod"]["def"]["options"][0]>().toEqualTypeOf<z.ZodString>();
  const array: ArrayField = z.array(z.string());
  const tuple: TupleField = z.tuple([z.string()]);
  const defaultTuple: z.output<DefaultTupleField> = [["leaf"]];
  const combined: z.output<Combined> = { children: ["leaf", { child: "leaf" }] };
  expect(array.parse(["leaf"])).toEqual(["leaf"]);
  expect(tuple.parse(["leaf"])).toEqual(["leaf"]);
  expect(defaultTuple).toEqual([["leaf"]]);
  expect(combined).toEqual({ children: ["leaf", { child: "leaf" }] });

  function negative(
    values: Readonly<z.output<z.ZodArray<ArrayField>>>,
    tuple: z.output<z.ZodTuple<[TupleField], null>>
  ) {
    // @ts-expect-error native readonly arrays cannot mutate
    values.push("leaf");
    // @ts-expect-error fixed tuples remain out of bounds
    tuple[1];
    // @ts-expect-error recursive arrays reject numeric leaves
    const badArray: z.output<ArrayField> = [[123]];
    // @ts-expect-error recursive tuples reject numeric leaves
    const badTuple: z.output<TupleField> = [[123]];
    // @ts-expect-error combined containers reject numeric leaves
    const badCombined: z.output<Combined> = { child: [123] };
    void [badArray, badTuple, badCombined];
  }
  void negative;
});

test("recursive wrapper schema definitions", () => {
  type Optional = z.ZodOptional<Optional>;
  type Nullable = z.ZodNullable<Nullable>;
  type Default = z.ZodDefault<Default>;
  type Prefault = z.ZodPrefault<Prefault>;
  type NonOptional = z.ZodNonOptional<NonOptional>;
  type Catch = z.ZodCatch<Catch>;
  type Readonly = z.ZodReadonly<Readonly>;
  type Lazy = z.ZodLazy<Lazy>;
  type Pipe = z.core.$ZodPipe<Child, z.core.$ZodTransform>;
  type Child = z.core.$ZodString | Pipe;

  expectTypeOf<Optional["_zod"]["def"]["innerType"]>().toEqualTypeOf<Optional>();
  expectTypeOf<Nullable["_zod"]["def"]["innerType"]>().toEqualTypeOf<Nullable>();
  expectTypeOf<Default["_zod"]["def"]["innerType"]>().toEqualTypeOf<Default>();
  expectTypeOf<Prefault["_zod"]["def"]["innerType"]>().toEqualTypeOf<Prefault>();
  expectTypeOf<NonOptional["_zod"]["def"]["innerType"]>().toEqualTypeOf<NonOptional>();
  expectTypeOf<Catch["_zod"]["def"]["innerType"]>().toEqualTypeOf<Catch>();
  expectTypeOf<Readonly["_zod"]["def"]["innerType"]>().toEqualTypeOf<Readonly>();
  expectTypeOf<ReturnType<Lazy["_zod"]["def"]["getter"]>>().toEqualTypeOf<Lazy>();
  function pipe(source: Child): Pipe {
    return z.pipe(
      source,
      z.transform((value: unknown) => value)
    );
  }
  expect(z.core.parse(pipe(z.string()), "leaf")).toBe("leaf");
});

test("recursive tuple rests retain native value types", () => {
  type Field = z.ZodString | z.ZodTuple<[z.ZodNumber], Field>;
  type TupleValue = [number, ...string[]] | [number, ...TupleValue[]];
  type Value = string | TupleValue;
  expectTypeOf<z.input<Field>>().toEqualTypeOf<Value>();
  expectTypeOf<z.output<Field>>().toEqualTypeOf<Value>();
  const value: z.output<Field> = [1, [2, "nested"], [3]];
  expect(value).toEqual([1, [2, "nested"], [3]]);
  expectTypeOf<z.output<z.ZodTuple<[z.ZodNumber], z.ZodString | z.ZodNumber>>>().toEqualTypeOf<
    [number, ...string[]] | [number, ...number[]]
  >();
  const stringRest: Field = z.tuple([z.number()], z.string());
  const tupleRest: Field = z.tuple([z.number()], z.tuple([z.number()], z.string()));
  const mixed = [1, "leaf", [2], "leaf"];
  expect(stringRest.safeParse(mixed).success).toBe(false);
  expect(tupleRest.safeParse(mixed).success).toBe(false);
  const unionRest = z.tuple([z.number()], z.union([z.string(), z.tuple([z.number()])]));
  const mixedOutput: z.output<typeof unionRest> = [1, "leaf", [2], "leaf"];
  expect(unionRest.parse(mixed)).toEqual(mixedOutput);
  expectTypeOf<z.output<typeof unionRest>>().toEqualTypeOf<[number, ...(string | [number])[]]>();
  // @ts-expect-error a union rest schema is not a union of rest schemas
  const notField: Field = unionRest;
  // @ts-expect-error recursive rests reject invalid leaves
  const invalid: z.input<Field> = [1, true];
  // @ts-expect-error recursive rests retain the fixed prefix
  const missingPrefix: z.output<Field> = ["leaf"];
  void [invalid, missingPrefix, notField];
});

test("recursive metadata overrides determine object optionality", () => {
  interface Internals extends z.core.$ZodPipeInternals<Child, z.core.$ZodTransform> {
    optin: "optional";
    optout: "optional";
    values: undefined;
    propValues: undefined;
    input: unknown;
    output: unknown;
  }
  interface Custom extends z.core.$ZodPipe<Child, z.core.$ZodTransform> {
    _zod: Internals;
  }
  type Child = z.core.$ZodString | Custom;
  type Wrapped = z.core.$ZodReadonly<Custom>;
  expectTypeOf<Wrapped["_zod"]["optin"]>().toEqualTypeOf<z.core._$ZodTypeInternals["optin"]>();
  const absent: z.input<z.core.$ZodObject<{ field: Wrapped }>> = {};
  expect(absent).toEqual({});
  interface AnyInternals extends Internals {
    optin: any;
    optout: any;
  }
  interface AnyCustom extends Custom {
    _zod: AnyInternals;
  }
  const anyAbsent: z.input<z.core.$ZodObject<{ field: AnyCustom }>> = {};
  expect(anyAbsent).toEqual({});

  const branded = z.array(z.string()).brand<"array">();
  expectTypeOf<z.output<typeof branded>>().toEqualTypeOf<string[] & z.core.$brand<"array">>();
  const nested = z.array(branded);
  expectTypeOf<z.output<typeof nested>>().toEqualTypeOf<(string[] & z.core.$brand<"array">)[]>();
});

test("recursive pipe projections terminate at opaque leaves", () => {
  type BigIntChild = z.core.$ZodBigInt | z.core.$ZodPipe<BigIntChild, z.core.$ZodTransform>;
  type DateChild = z.core.$ZodDate | z.core.$ZodPipe<DateChild, z.core.$ZodTransform>;
  type CustomChild = z.core.$ZodCustom | z.core.$ZodPipe<CustomChild, z.core.$ZodTransform>;
  expectTypeOf<z.input<BigIntChild>>().toBeUnknown();
  expectTypeOf<z.output<BigIntChild>>().toBeUnknown();
  expectTypeOf<z.input<DateChild>>().toBeUnknown();
  expectTypeOf<z.output<DateChild>>().toBeUnknown();
  expectTypeOf<z.input<CustomChild>>().toBeUnknown();
  expectTypeOf<z.output<CustomChild>>().toBeUnknown();

  type Leaf =
    | z.core.$ZodString
    | z.core.$ZodNumber
    | z.core.$ZodBoolean
    | z.core.$ZodBigInt
    | z.core.$ZodSymbol
    | z.core.$ZodUndefined
    | z.core.$ZodNull
    | z.core.$ZodAny
    | z.core.$ZodUnknown
    | z.core.$ZodNever
    | z.core.$ZodVoid
    | z.core.$ZodDate
    | z.core.$ZodEnum
    | z.core.$ZodLiteral
    | z.core.$ZodFile
    | z.core.$ZodTransform
    | z.core.$ZodNaN
    | z.core.$ZodTemplateLiteral
    | z.core.$ZodCustom;
  expectTypeOf<Exclude<Leaf, { _zod: { atomic?: true } }>>().toBeNever();
});

test("opaque recursive schema views retain explicit input and output", () => {
  interface Internals extends z.core.$ZodArrayInternals<Field> {
    atomic?: true;
    input: string[];
    output: string[];
  }
  interface Custom extends z.core.$ZodArray<Field> {
    _zod: Internals;
  }
  type Field = z.core.$ZodString | Custom;
  expectTypeOf<z.output<z.ZodArray<Custom>>>().toEqualTypeOf<string[][]>();
  expectTypeOf<z.input<z.ZodArray<Custom>>>().toEqualTypeOf<string[][]>();
});

test("definition-based optionality preserves declared pipe overrides", () => {
  type Target = z.core.$ZodOptional<z.core.$ZodString>;
  type Preprocess = z.core.$ZodPreprocess<Target>;
  type Pipe = z.core.$ZodPipe<z.core.$ZodTransform<unknown, unknown>, Target>;
  expectTypeOf<Preprocess["_zod"]["def"]>().toEqualTypeOf<Pipe["_zod"]["def"]>();
  expectTypeOf<z.input<z.core.$ZodObject<{ field: Preprocess }, z.core.$strip>>>().toEqualTypeOf<{ field?: unknown }>();
  expectTypeOf<z.input<z.core.$ZodObject<{ field: Pipe }, z.core.$strip>>>().toEqualTypeOf<{ field: unknown }>();
});

test("recursive core schema graphs support narrowing and traversal", () => {
  type Primitive = z.core.$ZodString | z.core.$ZodNumber | z.core.$ZodBoolean | z.core.$ZodNull | z.core.$ZodUndefined;
  interface ObjectField extends z.core.$ZodObject<FieldShape, z.core.$strict> {}
  interface ArrayField extends z.core.$ZodArray<Field> {}
  interface TupleField extends z.core.$ZodTuple<readonly [Field, ...Field[]]> {}
  interface LazyField extends z.core.$ZodLazy<Field> {}
  interface NullableField extends z.core.$ZodNullable<Field> {}
  interface ReadonlyField extends z.core.$ZodReadonly<Field> {}
  interface PipeField extends z.core.$ZodPipe<Field, z.core.$ZodTransform> {}
  type Field =
    | Primitive
    | ObjectField
    | ArrayField
    | TupleField
    | LazyField
    | NullableField
    | ReadonlyField
    | PipeField;
  type FieldShape = Record<string, Field>;

  function isObject(schema: unknown): schema is ObjectField {
    return schema instanceof z.core.$ZodObject;
  }
  function unwrap(schema: Field): Field {
    switch (schema._zod.def.type) {
      case "object":
        return schema._zod.def.shape.value;
      case "array":
        return schema._zod.def.element;
      case "tuple":
        return schema._zod.def.items[0];
      case "nullable":
      case "readonly":
        return schema._zod.def.innerType;
      case "lazy":
        return schema._zod.def.getter();
      case "pipe":
        return schema._zod.def.in;
      default:
        return schema;
    }
  }
  const schema = z.strictObject({ value: z.string() });
  const unknownSchema: unknown = schema;
  if (!isObject(unknownSchema)) throw new Error("expected an object schema");
  expect(unwrap(unknownSchema)).toBe(schema.shape.value);
  expect(schema.parse({ value: "leaf" })).toEqual({ value: "leaf" });
  expect(schema.safeParse({ value: 123 }).success).toBe(false);
  expectTypeOf<z.output<typeof schema>>().toEqualTypeOf<{ value: string }>();
});

test("recursive object schema type aliases", () => {
  type ObjectField = z.ZodObject<{ [k: string]: ObjectField }>;
  type MixedField = z.ZodString | z.ZodObject<{ [k: string]: MixedField }>;
  expectTypeOf<ObjectField>().toExtend<z.ZodType>();
  expectTypeOf<MixedField>().toExtend<z.ZodType>();

  type ObjectValue = { [k: string]: ObjectValue };
  type MixedValue = string | { [k: string]: MixedValue };
  expectTypeOf<z.input<ObjectField>>().toEqualTypeOf<ObjectValue>();
  expectTypeOf<z.output<ObjectField>>().toEqualTypeOf<ObjectValue>();
  expectTypeOf<z.input<MixedField>>().toEqualTypeOf<MixedValue>();
  expectTypeOf<z.output<MixedField>>().toEqualTypeOf<MixedValue>();

  const schema: MixedField = z.object({ name: z.string(), nested: z.object({ name: z.string() }) });
  expect(schema.parse({ name: "a", nested: { name: "b", extra: true } })).toEqual({
    name: "a",
    nested: { name: "b" },
  });
  expect(schema.safeParse({ name: "a", nested: { name: 123 } }).success).toBe(false);

  type CoreField = z.core.$ZodString<string> | z.core.$ZodObject<{ [k: string]: CoreField }>;
  expectTypeOf<z.input<CoreField>>().toEqualTypeOf<MixedValue>();
  expectTypeOf<z.output<CoreField>>().toEqualTypeOf<MixedValue>();
});

test("recursive object aliases preserve distinct input and output", () => {
  type Field = z.ZodPipe<z.ZodString, z.ZodTransform<number, string>> | z.ZodObject<{ [k: string]: Field }>;
  type Input = string | { [k: string]: Input };
  type Output = number | { [k: string]: Output };
  expectTypeOf<z.input<Field>>().toEqualTypeOf<Input>();
  expectTypeOf<z.output<Field>>().toEqualTypeOf<Output>();
  const schema: Field = z.object({ nested: z.object({ length: z.string().transform((s) => s.length) }) });
  expect(schema.parse({ nested: { length: "abc" } })).toEqual({ nested: { length: 3 } });
  expect(schema.safeParse({ nested: { length: 3 } }).success).toBe(false);
});

test("indexed object inference preserves string keys", () => {
  type Indexed = z.ZodObject<Record<string, z.ZodString>>;
  type Recursive = z.ZodObject<Record<string, Recursive>>;
  expectTypeOf<keyof z.input<Indexed>>().toEqualTypeOf<string>();
  expectTypeOf<keyof z.output<Indexed>>().toEqualTypeOf<string>();
  expectTypeOf<keyof z.input<Recursive>>().toEqualTypeOf<string>();
  expectTypeOf<keyof z.output<Recursive>>().toEqualTypeOf<string>();
});

test("recursion with z.lazy", () => {
  const data = {
    name: "I",
    subcategories: [
      {
        name: "A",
        subcategories: [
          {
            name: "1",
            subcategories: [
              {
                name: "a",
                subcategories: [],
              },
            ],
          },
        ],
      },
    ],
  };

  const Category = z.object({
    name: z.string(),
    get subcategories() {
      return z.array(Category).optional().nullable();
    },
  });
  type Category = z.infer<typeof Category>;
  interface _Category {
    name: string;
    subcategories?: _Category[] | undefined | null;
  }
  expectTypeOf<Category>().toEqualTypeOf<_Category>();
  Category.parse(data);
});

test("recursion involving union type", () => {
  const data = {
    value: 1,
    next: {
      value: 2,
      next: {
        value: 3,
        next: {
          value: 4,
          next: null,
        },
      },
    },
  };

  const LL = z.object({
    value: z.number(),
    get next() {
      return LL.nullable();
    },
  });
  type LL = z.infer<typeof LL>;
  type _LL = {
    value: number;
    next: _LL | null;
  };
  expectTypeOf<LL>().toEqualTypeOf<_LL>();

  LL.parse(data);
});

test("mutual recursion - native", () => {
  const Alazy = z.object({
    val: z.number(),
    get b() {
      return Blazy;
    },
  });

  const Blazy = z.object({
    val: z.number(),
    get a() {
      return Alazy.optional();
    },
  });
  const testData = {
    val: 1,
    b: {
      val: 5,
      a: {
        val: 3,
        b: {
          val: 4,
          a: {
            val: 2,
            b: {
              val: 1,
            },
          },
        },
      },
    },
  };

  type Alazy = z.infer<typeof Alazy>;
  type Blazy = z.infer<typeof Blazy>;
  interface _Alazy {
    val: number;
    b: _Blazy;
  }
  interface _Blazy {
    val: number;
    a?: _Alazy | undefined;
  }
  expectTypeOf<Alazy>().toEqualTypeOf<_Alazy>();
  expectTypeOf<Blazy>().toEqualTypeOf<_Blazy>();
  Alazy.parse(testData);
  Blazy.parse(testData.b);

  expect(() => Alazy.parse({ val: "asdf" })).toThrow();
});

test("pick and omit with getter", () => {
  const Category = z.strictObject({
    name: z.string(),
    get subcategories() {
      return z.array(Category);
    },
  });

  type Category = z.infer<typeof Category>;

  interface _Category {
    name: string;
    subcategories: _Category[];
  }
  expectTypeOf<Category>().toEqualTypeOf<_Category>();

  // Shape should not surface `readonly` modifiers from getter-defined keys. object/strictObject/looseObject all pass shape through util.Writeable<T>.
  type Shape = (typeof Category)["shape"];
  expectTypeOf<Shape>().toEqualTypeOf<{ name: z.ZodString; subcategories: z.ZodArray<typeof Category> }>();

  const PickedCategory = Category.pick({ name: true });
  const OmittedCategory = Category.omit({ subcategories: true });

  const picked = { name: "test" };
  const omitted = { name: "test" };

  PickedCategory.parse(picked);
  OmittedCategory.parse(omitted);

  expect(() => PickedCategory.parse({ name: "test", subcategories: [] })).toThrow();
  expect(() => OmittedCategory.parse({ name: "test", subcategories: [] })).toThrow();
});

test("shape stays writeable through extend/safeExtend/partial/required", () => {
  const Base = z.object({ name: z.string() });

  const Extended = Base.extend({
    get sub() {
      return z.array(Extended);
    },
  });
  type ExtendedShape = (typeof Extended)["shape"];
  expectTypeOf<ExtendedShape>().toEqualTypeOf<{
    name: z.ZodString;
    sub: z.ZodArray<typeof Extended>;
  }>();

  const SafeExt = Base.safeExtend({ extra: z.string() } as const);
  type SafeExtShape = (typeof SafeExt)["shape"];
  expectTypeOf<SafeExtShape>().toEqualTypeOf<{
    name: z.ZodString;
    extra: z.ZodString;
  }>();

  const FromConst = Base.extend({ a: z.string(), b: z.number() } as const);
  type FromConstShape = (typeof FromConst)["shape"];
  expectTypeOf<FromConstShape>().toEqualTypeOf<{
    name: z.ZodString;
    a: z.ZodString;
    b: z.ZodNumber;
  }>();

  const PartialExtended = Extended.partial();
  type PartialShape = (typeof PartialExtended)["shape"];
  expectTypeOf<PartialShape>().toEqualTypeOf<{
    name: z.ZodOptional<z.ZodString>;
    sub: z.ZodOptional<z.ZodArray<typeof Extended>>;
  }>();

  const RequiredExtended = Extended.required();
  type RequiredShape = (typeof RequiredExtended)["shape"];
  expectTypeOf<RequiredShape>().toEqualTypeOf<{
    name: z.ZodNonOptional<z.ZodString>;
    sub: z.ZodNonOptional<z.ZodArray<typeof Extended>>;
  }>();
});

test("deferred self-recursion", () => {
  const Feature = z.object({
    title: z.string(),
    get features(): z.ZodOptional<z.ZodArray<typeof Feature>> {
      return z.optional(z.array(Feature)); //.optional();
    },
  });
  // type Feature = z.infer<typeof Feature>;

  const Output = z.object({
    id: z.int(), //.nonnegative(),
    name: z.string(),
    get features(): z.ZodArray<typeof Feature> {
      return Feature.array();
    },
  });
  type Output = z.output<typeof Output>;

  type _Feature = {
    title: string;
    features?: _Feature[] | undefined;
  };

  type _Output = {
    id: number;
    name: string;
    features: _Feature[];
  };

  // expectTypeOf<Feature>().toEqualTypeOf<_Feature>();
  expectTypeOf<Output>().toEqualTypeOf<_Output>();
});

test("deferred mutual recursion", () => {
  const Slot = z.object({
    slotCode: z.string(),

    get blocks() {
      return z.array(Block);
    },
  });
  type Slot = z.infer<typeof Slot>;

  const Block = z.object({
    blockCode: z.string(),
    get slots() {
      return z.array(Slot).optional();
    },
  });
  type Block = z.infer<typeof Block>;

  const Page = z.object({
    slots: z.array(Slot),
  });
  type Page = z.infer<typeof Page>;

  type _Slot = {
    slotCode: string;
    blocks: _Block[];
  };
  type _Block = {
    blockCode: string;
    slots?: _Slot[] | undefined;
  };
  type _Page = {
    slots: _Slot[];
  };
  expectTypeOf<Slot>().toEqualTypeOf<_Slot>();
  expectTypeOf<Block>().toEqualTypeOf<_Block>();
  expectTypeOf<Page>().toEqualTypeOf<_Page>();
});

test("mutual recursion with meta", () => {
  const A = z
    .object({
      name: z.string(),
      get b() {
        return B;
      },
    })
    .readonly()
    .meta({ id: "A" })
    .optional();

  const B = z
    .object({
      name: z.string(),
      get a() {
        return A;
      },
    })
    .readonly()
    .meta({ id: "B" });

  type A = z.infer<typeof A>;
  type B = z.infer<typeof B>;

  type _A =
    | Readonly<{
        name: string;
        b: _B;
      }>
    | undefined;
  // | undefined;
  type _B = Readonly<{
    name: string;
    a?: _A;
  }>;
  expectTypeOf<A>().toEqualTypeOf<_A>();
  expectTypeOf<B>().toEqualTypeOf<_B>();
});

test("intersection with recursive types", () => {
  const A = z.discriminatedUnion("type", [
    z.object({
      type: z.literal("CONTAINER"),
    }),
    z.object({
      type: z.literal("SCREEN"),
      config: z.object({ x: z.number(), y: z.number() }),
    }),
  ]);
  // type A = z.infer<typeof A>;

  const B = z.object({
    get children() {
      return z.array(C).optional();
    },
  });
  // type B = z.infer<typeof B>;

  const C = z.intersection(A, B);
  type C = z.infer<typeof C>;

  type _C = (
    | {
        type: "CONTAINER";
      }
    | {
        type: "SCREEN";
        config: {
          x: number;
          y: number;
        };
      }
  ) & {
    children?: _C[] | undefined;
  };
  expectTypeOf<C>().toEqualTypeOf<_C>();
});

test("object utilities with recursive types", () => {
  const NodeBase = z.object({
    id: z.string(),
    name: z.string(),
    get children() {
      return z.array(Node).optional();
    },
  });

  // Test extend with new keys (extend throws when overwriting existing keys)
  const NodeOne = NodeBase.extend({
    name: z.literal("nodeOne"),
    get children() {
      return z.array(Node);
    },
  });

  const NodeTwo = NodeBase.extend({
    name: z.literal("nodeTwo"),
    get children() {
      return z.array(Node);
    },
  });

  // Test pick
  const PickedNode = NodeBase.pick({ id: true, name: true });

  // Test omit
  const OmittedNode = NodeBase.omit({ children: true });

  // Test merge
  const ExtraProps = {
    metadata: z.string(),
    get parent() {
      return Node.optional();
    },
  };
  const MergedNode = NodeBase.extend(ExtraProps);

  // Test partial
  const PartialNode = NodeBase.partial();
  const PartialMaskedNode = NodeBase.partial({ name: true });

  // Test required (assuming NodeBase has optional fields)
  const OptionalNodeBase = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    get children() {
      return z.array(Node).optional();
    },
  });
  const RequiredNode = OptionalNodeBase.required();
  const RequiredMaskedNode = OptionalNodeBase.required({ id: true });

  const Node = z.union([
    NodeOne,
    NodeTwo,
    PickedNode,
    OmittedNode,
    MergedNode,
    PartialNode,
    PartialMaskedNode,
    RequiredNode,
    RequiredMaskedNode,
  ]);
});

test("tuple with recursive types", () => {
  const TaskListNodeSchema = z.strictObject({
    type: z.literal("taskList"),
    get content() {
      return z.array(z.tuple([TaskListNodeSchema, z.union([TaskListNodeSchema])])).min(1);
    },
  });
  type TaskListNodeSchema = z.infer<typeof TaskListNodeSchema>;
  type _TaskListNodeSchema = {
    type: "taskList";
    content: [_TaskListNodeSchema, _TaskListNodeSchema][];
  };
  expectTypeOf<TaskListNodeSchema>().toEqualTypeOf<_TaskListNodeSchema>();
});

test("recursion compatibility", () => {
  // array
  const A = z.object({
    get array() {
      return A.array();
    },
    get optional() {
      return A.optional();
    },
    get nullable() {
      return A.nullable();
    },
    get nonoptional() {
      return A.nonoptional();
    },
    get readonly() {
      return A.readonly();
    },
    get describe() {
      return A.describe("A recursive type");
    },
    get meta() {
      return A.meta({ description: "A recursive type" });
    },
    get pipe() {
      return A.pipe(z.any());
    },
    get strict() {
      return A.strict();
    },
    get tuple() {
      return z.tuple([A, A]);
    },
    get object() {
      return z
        .object({
          subcategories: A,
        })
        .strict()
        .loose();
    },
    get union() {
      return z.union([A, A]);
    },
    get intersection() {
      return z.intersection(A, A);
    },
    get record() {
      return z.record(z.string(), A);
    },
    get map() {
      return z.map(z.string(), A);
    },
    get set() {
      return z.set(A);
    },
    get lazy() {
      return z.lazy(() => A);
    },
    get promise() {
      return z.promise(A);
    },
  });
});

test("recursive object with .check()", () => {
  const Category = z
    .object({
      id: z.string(),
      name: z.string(),
      get subcategories() {
        return z.array(Category).optional();
      },
    })
    .check((ctx) => {
      // Check for duplicate IDs among direct subcategories
      if (ctx.value.subcategories) {
        const siblingIds = new Set<string>();
        ctx.value.subcategories.forEach((sub, index) => {
          if (siblingIds.has(sub.id)) {
            ctx.issues.push({
              code: "custom",
              message: `Duplicate sibling ID found: ${sub.id}`,
              path: ["subcategories", index, "id"],
              input: ctx.value,
            });
          }
          siblingIds.add(sub.id);
        });
      }
    });

  // Valid - siblings have unique IDs
  const validData = {
    id: "electronics",
    name: "Electronics",
    subcategories: [
      {
        id: "computers",
        name: "Computers",
        subcategories: [
          { id: "laptops", name: "Laptops" },
          { id: "desktops", name: "Desktops" },
        ],
      },
      {
        id: "phones",
        name: "Phones",
      },
    ],
  };

  // Invalid - duplicate sibling IDs
  const invalidData = {
    id: "electronics",
    name: "Electronics",
    subcategories: [
      { id: "computers", name: "Computers" },
      { id: "phones", name: "Phones" },
      { id: "computers", name: "Computers Again" }, // Duplicate at index 2
    ],
  };

  expect(() => Category.parse(validData)).not.toThrow();
  expect(() => Category.parse(invalidData)).toThrow();
});

// biome-ignore lint/suspicious/noExportsInTest: unexported it trips noUnusedVariables instead
export type RecursiveA = z.ZodUnion<
  [
    z.ZodObject<{
      a: z.ZodDefault<RecursiveA>;
      b: z.ZodPrefault<RecursiveA>;
      c: z.ZodNonOptional<RecursiveA>;
      d: z.ZodOptional<RecursiveA>;
      e: z.ZodNullable<RecursiveA>;
      g: z.ZodReadonly<RecursiveA>;
      h: z.ZodPipe<RecursiveA, z.ZodString>;
      i: z.ZodArray<RecursiveA>;
      j: z.ZodSet<RecursiveA>;
      k: z.ZodMap<RecursiveA, RecursiveA>;
      l: z.ZodRecord<z.ZodString, RecursiveA>;
      m: z.ZodUnion<[RecursiveA, RecursiveA]>;
      n: z.ZodIntersection<RecursiveA, RecursiveA>;
      o: z.ZodLazy<RecursiveA>;
      p: z.ZodPromise<RecursiveA>;
      q: z.ZodCatch<RecursiveA>;
      r: z.ZodSuccess<RecursiveA>;
      s: z.ZodTransform<RecursiveA, string>;
      t: z.ZodTuple<[RecursiveA, RecursiveA]>;
      u: z.ZodObject<{
        a: RecursiveA;
      }>;
    }>,
  ]
>;

test("recursive type with `id` meta", () => {
  const AType = z.object({
    type: z.literal("a"),
    name: z.string(),
  });

  const BType = z.object({
    type: z.literal("b"),
    name: z.string(),
  });

  const CType = z.object({
    type: z.literal("c"),
    name: z.string(),
  });

  const Schema = z.object({
    type: z.literal("special").meta({ description: "Type" }),
    config: z.object({
      title: z.string().meta({ description: "Title" }),
      get elements() {
        return z.array(z.discriminatedUnion("type", [AType, BType, CType])).meta({
          id: "SpecialElements",
          title: "SpecialElements",
          description: "Array of elements",
        });
      },
    }),
  });

  Schema.parse({
    type: "special",
    config: {
      title: "Special",
      elements: [
        { type: "a", name: "John" },
        { type: "b", name: "Jane" },
        { type: "c", name: "Jim" },
      ],
    },
  });
});

test("mutual recursion through discriminatedUnion getter", () => {
  const variantA = z.object({
    kind: z.literal("a"),
    get child() {
      return tree.optional();
    },
  });

  const variantB = z.object({
    kind: z.literal("b"),
    get sibling() {
      return tree.optional();
    },
  });

  const tree = z.discriminatedUnion("kind", [variantA, variantB]);

  type _Tree = { kind: "a"; child?: _Tree | undefined } | { kind: "b"; sibling?: _Tree | undefined };

  const treeUnion = z.union([variantA, variantB]);

  expectTypeOf<z.input<typeof tree>>().toEqualTypeOf<_Tree>();
  expectTypeOf<z.input<typeof tree>>().not.toBeAny();
  expectTypeOf<z.input<typeof tree>>().toEqualTypeOf<z.input<typeof treeUnion>>();

  expect(tree.parse({ kind: "a", child: { kind: "b", sibling: { kind: "a" } } })).toEqual({
    kind: "a",
    child: { kind: "b", sibling: { kind: "a" } },
  });
  expect(() => tree.parse({ kind: "c" })).toThrow();
});
