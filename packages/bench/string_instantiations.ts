const FILE = `
import {string} from "./packages/zod-core/src/index.js";

const schema = string();
const result = schema.parse("hello");
`;
