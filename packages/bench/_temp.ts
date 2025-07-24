import { string } from "zod/v4";

const schema = string();
const result = schema.parse("hello");
