# NaNs

You can customize certain error messages when creating a nan schema.

```ts
const isNaN = z.nan({
  required_error: "isNaN is required",
  invalid_type_error: "isNaN must be not a number",
});
```
