import * as z from "zod";

/** Standard FORM:
 * const schema = z.jwt();
 * const data = "...";
 * const result = z.safeParse(schema, data);
 * console.log(JSON.stringify(result, null, 2));
 */

const schema = z.interface({
  val: z.number(),
  get b() {
    return b_schema;
  },
});

const b_schema = z.interface({
  val: z.number(),
  get a() {
    return schema.optional();
  },
});

const data = {
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

const result = schema.safeParse(data);
console.log(JSON.stringify(result, null, 2));
