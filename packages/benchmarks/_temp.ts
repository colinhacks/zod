import { string } from "zod-core";

const schema = string();
const result = schema.parse("hello");
