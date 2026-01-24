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
});
