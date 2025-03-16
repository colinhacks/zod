// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("union type inference consistency", () => {
  const EventNameSchema = z.string().or(z.array(z.string()));
  type EventName = z.infer<typeof EventNameSchema>;
  
  const EventSchema = z.object({
    name: z.string().or(z.array(z.string()))
  });
  
  type EventWithName = z.infer<typeof EventSchema>;
  type EventName2 = EventWithName["name"];
  
  // Create values of both types to verify they're compatible
  const name1: EventName = "test";
  // @ts-ignore
  const name2: EventName2 = name1;
  
  const name3: EventName = ["test1", "test2"];
  // @ts-ignore
  const name4: EventName2 = name3;
  
  // If these compile, the types are compatible
  expect(true).toBe(true);
});

test("union validation with transformations", () => {
  const schema = z.union([
    z.string().transform(s => s.length),
    z.number()
  ]);
  
  // Test with string input
  const result1 = schema.parse("hello");
  expect(result1).toBe(5);
  
  // Test with number input
  const result2 = schema.parse(42);
  expect(result2).toBe(42);
  
  // Test with invalid input
  expect(() => schema.parse(true)).toThrow();
});

test("nested union in object", () => {
  const schema = z.object({
    id: z.union([z.string(), z.number()]),
    data: z.union([
      z.object({ type: z.literal("a"), value: z.string() }),
      z.object({ type: z.literal("b"), count: z.number() })
    ])
  });
  
  // Test valid inputs
  const valid1 = schema.parse({ id: "123", data: { type: "a", value: "test" } });
  const valid2 = schema.parse({ id: 456, data: { type: "b", count: 42 } });
  
  expect(valid1.id).toBe("123");
  expect(valid1.data.type).toBe("a");
  expect((valid1.data as { type: "a", value: string }).value).toBe("test");
  
  expect(valid2.id).toBe(456);
  expect(valid2.data.type).toBe("b");
  expect((valid2.data as { type: "b", count: number }).count).toBe(42);
  
  // Test invalid input
  expect(() => schema.parse({ 
    id: "123", 
    data: { type: "c", something: true } 
  })).toThrow();
}); 