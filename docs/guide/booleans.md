# Booleans

You can customize certain error messages when creating a boolean schema.

```ts
const isActive = z.boolean({
  required_error: "isActive is required",
  invalid_type_error: "isActive must be a boolean",
});
```
