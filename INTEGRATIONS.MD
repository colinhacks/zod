This document describes recipes to integrate Zod with other popular libraries.

## Mongoose
[Mongoose](https://mongoosejs.com/) has built-in schema definition and validation. However, in projects involving both Mongoose and Zod, it would make sense to unify both schemas under one declaration, to keep the code DRY - and in turn easier to maintain and reason about. Since Mongoose's schemas are tied to the database (Mongoose *is* an ODM, after all), and cannot be "exported" as plain object validators, the reasonable method of integrating the two is by instructing Mongoose to use Zod for validation, instead of its own schemas.

This implementation makes use of Mongoose's [middleware](https://mongoosejs.com/docs/middleware.html) functionality, specifically the `pre('validate')` hook. The Mongoose schema definitions are essentially left empty, and the validate hook calls Zod's parsing methods to do the work.

Creating the integration is simple; the main steps are:
1. Define your Zod schemas (as you would usually do)
2. Create a new Mongoose model, with an empty schema and `strict` set to `false`
3. Add a pre validate hook to the (Mongoose) schema, which validates documents

However, there is one obstacle to overcome for a clean implementation - in the pre-validate hook, the target document is exposed as the `this` parameter, instead of a function parameter which may be modified and returned (as is the case in many other places, such as the array `map` function, Redux reducers, etc.). After parsing `this` in the hook, we can't just return the object, but have to manually sync up `this` with the parsed object (without breaking Mongoose's inner logic).

Following is an implementation of such a hook (specifically, the value returned from `syncWithSchema`):
```typescript
const documentKeys = [
  ...Object.getOwnPropertyNames(Document.prototype),
  //These were added manually; doesn't seem like there are more keys that the prototype misses
  '$__',
  'isNew',
  'errors',
  '$locals',
  '$op',
  '_doc'
];

type NonDocumentKey<T> = keyof Omit<T, keyof typeof Document.prototype>;

/**
 * Retrieves all of the keys (property *names*) of the target object, which do not belong
 * to the Document class (i.e. all non-document property keys of the object).
 * @param target the object to extract keys from.
 */
function getNonDocumentKeys<T extends Document>(target: T): NonDocumentKey<T>[] {
  const targetKeys = Object.getOwnPropertyNames(target);

  return targetKeys.filter(key => !documentKeys.includes(key)) as NonDocumentKey<T>[];
}

/**
 * Returns a *function* used for mongoose middleware validation.
 * Ideally, we could use Zod's parsing methods directly in the mongoose middleware, but since it
 * does not have the option to *return* the validated object, and instead provides it as the `this` parameter,
 * we need to iterate over `this`, after having parsed the relevant fields, assigning fields existing in the parsed response 
 * and deleting those that aren't.
 *
 * @param schema the schema to parse incoming objects by.
 */
function syncWithSchema<T>(schema: z.Schema<T>) {
  return async function (this: Document & T) {
    const modelKeys = getNonDocumentKeys(this);

    const modelFields = pick(this, modelKeys);

    /**
     * Of course, you may use `safeParseAsync` or a synchronous variant;
     * The reasoning for using parseAsync here is to support async schemas, as
     * well as throw any error *out* to be captured by the caller of the Mongoose
     * operation (e.g. insertOne).
     */ 
    const model = await schema.parseAsync(modelFields);

    //Sync up `this` with the parsed `model`.
    modelKeys.forEach((key: keyof T) => {
      if (key in model) {
        this[key] = model[key] as any;
      } else {
        delete this[key];
      }
    });
  };
}
```
> `Document` is Mongoose's Document - don't forget to import it!

> To keep the code organized, prefer placing the above code (or any equivalent) in its own file.

> `pick` is a simple pick-fields-from-object utility function. If you're not using any library that provides it, you may use this basic implementation:
```typescript
function pick<T extends {}, K extends keyof T>(o: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => ({ ...acc, [key]: o[key] }), {} as Pick<T, K>);
}
``` 

With that in place, you can easily create a Mongoose model from your Zod schema. For exmaple:
```typescript
//Hotel.ts
export const HotelSchema = z.object({
  name: z.string().nonempty(),
  address: z.string().nonempty(),
  numRooms: z.number().int().nonnegative(),
  //etc.
});

export interface Hotel extends z.infer<typeof HotelSchema> {}

```

```typescript
//HotelModel.ts

//Document is mongoose's Document
interface HotelDocument extends Hotel, Document {}

const hotelSchema = new mongoose.Schema({}, { strict: false });
hotelSchema.pre('validate', syncWithSchema(HotelSchema));

const HotelModel = mongoose.model<HotelDocument>('Hotel', hotelSchema);
```

Note that `syncWithSchema` is generic, and can be used for any schema.

Also, if your Mongoose schema uses features that Zod doesn't provide (such as a unique index, a ref, etc.), you may specify them on Mongoose schema; since those attributes are specific to MongoDB and Mongoose, it makes sense to define them on the Mongoose schema anyways, and it won't hurt maintainability too much.