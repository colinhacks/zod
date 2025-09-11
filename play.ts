import * as z from "zod";

const optionalSchema = z.string().optional();

type OptionalSchema = z.infer<typeof optionalSchema>;
//   ^? type OptionalSchema = string | undefined

const defaultedSchema = optionalSchema.default(undefined);
type DefaultedSchema = z.infer<typeof defaultedSchema>;
//   ^? type DefaultedSchema = string

z._default;
