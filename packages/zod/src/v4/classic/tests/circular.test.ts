import { describe, expect, it } from "vitest";
import { z } from "zod/v4";

describe("circular object validation", () => {
  it("should not hang on circular references via lazy", () => {
    // Define mutually recursive schemas
    const UserSchema: z.ZodType<any> = z.object({
      id: z.number(),
      posts: z.array(z.lazy(() => PostSchema)),
    });

    const PostSchema: z.ZodType<any> = z.object({
      title: z.string(),
      author: z.lazy(() => UserSchema),
    });

    // Create actual circular object in memory
    const user: any = { id: 1, posts: [] };
    const post = { title: "Hello World", author: user };
    user.posts.push(post);

    // Verify it's actually circular
    expect(user.posts[0].author).toBe(user);

    // This should complete without hanging
    // Currently it recurses infinitely
    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(1);
      expect(result.data.posts[0].title).toBe("Hello World");
    }
  });

  it("should validate direct self-reference", () => {
    // Schema that allows self-reference
    const NodeSchema: z.ZodType<any> = z.object({
      value: z.number(),
      self: z.lazy(() => NodeSchema).optional(),
    });

    // Create object that references itself
    const node: any = { value: 42 };
    node.self = node; // Direct circular reference

    // Verify it's actually circular
    expect(node.self).toBe(node);
    expect(node.self.self).toBe(node);

    // Should complete without infinite recursion
    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(42);
    }
  });

  it("should validate deeply nested circular reference", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      id: z.number(),
      children: z.array(z.lazy(() => NodeSchema)),
    });

    // Create a -> b -> c -> a cycle
    const a: any = { id: 1, children: [] };
    const b: any = { id: 2, children: [] };
    const c: any = { id: 3, children: [] };

    a.children.push(b);
    b.children.push(c);
    c.children.push(a); // Completes the cycle

    // Verify cycle exists
    expect(a.children[0].children[0].children[0]).toBe(a);

    const result = NodeSchema.safeParse(a);
    expect(result.success).toBe(true);
  });

  it("should still reject invalid circular objects", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      value: z.number(),
      next: z.lazy(() => NodeSchema).optional(),
    });

    // Create circular object with INVALID data
    const node: any = { value: "not a number" }; // Invalid!
    node.next = node;

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(false);
  });

  it("should report errors in mutually recursive circular objects", () => {
    // A -> B -> A where B has invalid data
    const ASchema: z.ZodType<any> = z.object({
      name: z.string(),
      ref: z.lazy(() => BSchema),
    });

    const BSchema: z.ZodType<any> = z.object({
      value: z.number(), // Will be invalid
      ref: z.lazy(() => ASchema),
    });

    const a: any = { name: "valid", ref: null };
    const b: any = { value: "not a number", ref: a }; // Invalid!
    a.ref = b;

    const result = ASchema.safeParse(a);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Error should be reported for b.value
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].path).toContain("ref");
    }
  });

  it("should report errors in array with circular references", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      values: z.array(z.union([z.lazy(() => NodeSchema), z.number()])),
    });

    // Create object where the array has: [circular, invalid, circular]
    const node: any = { values: [] };
    node.values.push(node); // circular
    node.values.push("not a number"); // invalid
    node.values.push(node); // circular again

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have error for the invalid element
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("should preserve circular structure in output", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      id: z.number(),
      next: z.lazy(() => NodeSchema).optional(),
    });

    const node: any = { id: 1 };
    node.next = node;

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(true);
    if (result.success) {
      // The output should preserve the circular structure
      expect(result.data.next).toBe(result.data);
    }
  });

  it("should work with async parsing", async () => {
    const NodeSchema: z.ZodType<any> = z.object({
      value: z.number(),
      next: z.lazy(() => NodeSchema).optional(),
    });

    const node: any = { value: 42 };
    node.next = node;

    const result = await NodeSchema.safeParseAsync(node);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(42);
      expect(result.data.next).toBe(result.data);
    }
  });

  it("should handle array referencing itself", () => {
    const Schema: z.ZodType<any> = z.array(z.union([z.number(), z.lazy(() => Schema)]));

    // Array that contains itself
    const arr: any[] = [1, 2, 3];
    arr.push(arr);

    const result = Schema.safeParse(arr);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0]).toBe(1);
      expect(result.data[3]).toBe(result.data); // Circular reference preserved
    }
  });

  it("should collect multiple errors in circular graph", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      id: z.number(),
      name: z.string(),
      next: z.lazy(() => NodeSchema).optional(),
    });

    // Create A -> B -> A where both have errors
    const a: any = { id: "not a number", name: "valid" }; // id invalid
    const b: any = { id: 2, name: 123 }; // name invalid
    a.next = b;
    b.next = a;

    const result = NodeSchema.safeParse(a);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have errors for both a.id and b.name
      expect(result.error.issues.length).toBe(2);
    }
  });

  it("should handle records with circular values", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      id: z.number(),
      children: z.record(
        z.string(),
        z.lazy(() => NodeSchema)
      ),
    });

    const node: any = { id: 1, children: {} };
    node.children.self = node;
    node.children.also_self = node;

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.children.self).toBe(result.data);
      expect(result.data.children.also_self).toBe(result.data);
    }
  });

  it("should handle nullable circular references", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      value: z.number(),
      next: z.lazy(() => NodeSchema).nullable(),
    });

    const node: any = { value: 1, next: null };
    node.next = node;

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.next).toBe(result.data);
    }
  });

  it("should handle complex graph with multiple cycles", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      id: z.number(),
      links: z.array(z.lazy(() => NodeSchema)),
    });

    // Create a complex graph: A <-> B, A <-> C, B <-> C (fully connected)
    const a: any = { id: 1, links: [] };
    const b: any = { id: 2, links: [] };
    const c: any = { id: 3, links: [] };

    a.links.push(b, c);
    b.links.push(a, c);
    c.links.push(a, b);

    const result = NodeSchema.safeParse(a);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(1);
      expect(result.data.links[0].id).toBe(2);
      expect(result.data.links[1].id).toBe(3);
      // Verify cycles are preserved
      expect(result.data.links[0].links[0]).toBe(result.data);
    }
  });

  it("should work with parse() not just safeParse()", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      value: z.number(),
      self: z.lazy(() => NodeSchema).optional(),
    });

    const node: any = { value: 42 };
    node.self = node;

    // Should not throw
    const result = NodeSchema.parse(node);
    expect(result.value).toBe(42);
    expect(result.self).toBe(result);
  });

  it("should throw with parse() on invalid circular data", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      value: z.number(),
      self: z.lazy(() => NodeSchema).optional(),
    });

    const node: any = { value: "invalid" };
    node.self = node;

    expect(() => NodeSchema.parse(node)).toThrow();
  });

  it("should handle circular references with default values", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      id: z.number(),
      name: z.string().default("unnamed"),
      next: z.lazy(() => NodeSchema).optional(),
    });

    const node: any = { id: 1 };
    node.next = node;

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("unnamed");
      expect(result.data.next).toBe(result.data);
    }
  });

  it("should handle circular references in strict objects", () => {
    const NodeSchema: z.ZodType<any> = z
      .object({
        id: z.number(),
        next: z.lazy(() => NodeSchema).optional(),
      })
      .strict();

    const node: any = { id: 1 };
    node.next = node;

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(true);
  });

  it("should reject extra keys in strict circular objects", () => {
    const NodeSchema: z.ZodType<any> = z
      .object({
        id: z.number(),
        next: z.lazy(() => NodeSchema).optional(),
      })
      .strict();

    const node: any = { id: 1, extra: "not allowed" };
    node.next = node;

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(false);
  });

  it("should handle tuple with circular reference", () => {
    const Schema: z.ZodType<any> = z.tuple([z.number(), z.lazy(() => Schema).optional()]);

    const tuple: any = [42, null];
    tuple[1] = tuple;

    const result = Schema.safeParse(tuple);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0]).toBe(42);
      expect(result.data[1]).toBe(result.data);
    }
  });

  it("should handle same object appearing multiple times (diamond pattern)", () => {
    const NodeSchema: z.ZodType<any> = z.object({
      id: z.number(),
      left: z.lazy(() => NodeSchema).optional(),
      right: z.lazy(() => NodeSchema).optional(),
    });

    // Diamond: A -> B, A -> C, B -> D, C -> D (D is shared)
    const d: any = { id: 4 };
    const b: any = { id: 2, left: d };
    const c: any = { id: 3, left: d };
    const a: any = { id: 1, left: b, right: c };

    const result = NodeSchema.safeParse(a);
    expect(result.success).toBe(true);
    if (result.success) {
      // Same object D should be reused
      expect(result.data.left.left).toBe(result.data.right.left);
    }
  });

  it("should handle circular reference with passthrough", () => {
    const NodeSchema: z.ZodType<any> = z
      .object({
        id: z.number(),
        next: z.lazy(() => NodeSchema).optional(),
      })
      .passthrough();

    const node: any = { id: 1, extra: "allowed" };
    node.next = node;

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.extra).toBe("allowed");
      expect(result.data.next).toBe(result.data);
    }
  });

  it("should handle deeply nested object inside circular structure", () => {
    const InnerSchema = z.object({
      deep: z.object({
        value: z.number(),
      }),
    });

    const NodeSchema: z.ZodType<any> = z.object({
      id: z.number(),
      inner: InnerSchema,
      next: z.lazy(() => NodeSchema).optional(),
    });

    const node: any = { id: 1, inner: { deep: { value: 42 } } };
    node.next = node;

    const result = NodeSchema.safeParse(node);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inner.deep.value).toBe(42);
      expect(result.data.next).toBe(result.data);
    }
  });

  it("should not use circular tracking for simple objects (performance)", () => {
    // This test verifies that simple objects without nested objects
    // don't incur the overhead of circular reference tracking
    const SimpleSchema = z.object({
      a: z.number(),
      b: z.string(),
      c: z.boolean(),
    });

    // Parse many simple objects - should be fast
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      SimpleSchema.parse({ a: i, b: "test", c: true });
    }
    const elapsed = performance.now() - start;

    // Should complete quickly (less than 1 second for 10k parses)
    expect(elapsed).toBeLessThan(1000);
  });
});
