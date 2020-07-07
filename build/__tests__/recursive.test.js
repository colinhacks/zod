"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const z = require("../index");
const A = z.lazy(() => z.object({
    // firstName: z.string(),
    val: z.number(),
    b: B,
}));
const B = z.lazy(() => z.object({
    // firstName:z.string(),
    val: z.number(),
    a: A,
}));
const a = { val: 1 };
const b = { val: 2 };
a.b = b;
b.a = a;
test('valid check', () => {
    A.parse(a);
    B.parse(b);
});
test('masking check', () => {
    const FragmentOnA = z
        .object({
        val: z.number(),
        b: z
            .object({
            val: z.number(),
            a: z
                .object({
                val: z.number(),
            })
                .nonstrict(),
        })
            .nonstrict(),
    })
        .nonstrict();
    const fragment = FragmentOnA.parse(a);
    expect(fragment).toBeDefined();
});
test('invalid check', () => {
    expect(() => A.parse({})).toThrow();
});
test('toJSON throws', () => {
    const checker = () => A.toJSON();
    expect(checker).toThrow();
});
test('schema getter', () => {
    expect(A.schema).toBeDefined();
});
test('self recursion', () => {
    const BaseCategory = z.object({
        name: z.string(),
    });
    const Category = BaseCategory.merge(z.object({
        subcategories: z.lazy(() => z.array(Category)),
    }));
    const untypedCategory = {
        name: 'Category A',
    };
    // creating a cycle
    untypedCategory.subcategories = [untypedCategory];
    Category.parse(untypedCategory); // parses successfully
});
//# sourceMappingURL=recursive.test.js.map