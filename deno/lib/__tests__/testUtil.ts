import * as z from "../index.ts";

/**
 * Creates shape validator for schema
 */
export const expectShape = <TExpected>() => ({
  /**
   * Pass your schema to this function. If the schema does not comply to the shape of this validator, you'll get a typescript error
   * @param _schema the schema to validate 
   */
  forSchema: <TSchema extends z.ZodTypeAny>(
    _schema: [TSchema["_output"]] extends [TExpected]
      ? [TExpected] extends [TSchema["_output"]]
      ? TSchema
      : never
      : never
  ) => {
    /* irrelevant */
  }
});
