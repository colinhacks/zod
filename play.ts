import { type } from "arktype";

const atschema = type({
  a: "string",
  b: "string",
  c: "string",
});

const result = atschema({
  a: "a",
  b: "b",
  c: "c",
});

console.log(result);
