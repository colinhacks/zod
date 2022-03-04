---
layout: doc-page
title: Intersections
parent: Defining schemas
nav_order: 19
previous:
    title: Sets
    path: ../sets
next:
    title: Recursive types
    path: ../recursive-types
---

<!-- > ⚠️ Intersections are deprecated. If you are trying to merge objects, use the `.merge` method instead. -->

Intersections are useful for creating "logical AND" types. This is useful for intersecting two object types.

```ts
const Person = z.object({
  name: z.string(),
})

const Employee = z.object({
  role: z.string(),
})

const EmployedPerson = z.intersection(Person, Employee)
const EmployedPerson = Person.and(Employee) // equivalent
```

Though in many cases, it is recommended to use `A.merge(B)` to merge two objects. The `.merge` method returns a new `ZodObject` instance, whereas `A.and(B)` returns a less useful `ZodIntersection` instance that lacks common object methods like `pick` and `omit`.

```ts
const a = z.union([z.number(), z.string()])
const b = z.union([z.number(), z.boolean()])
const c = z.intersection(a, b)

type c = z.infer<typeof c> // => number
```

<!-- Intersections in Zod are not smart. Whatever data you pass into `.parse()` gets passed into the two intersected schemas. Because Zod object schemas don't allow any unknown keys by default, there are some unintuitive behavior surrounding intersections of object schemas. -->

<!--

``` ts
const A = z.object({
  a: z.string(),
})

const B = z.object({
  b: z.string(),
})

const AB = z.intersection(A, B)

type Teacher = z.infer<typeof Teacher>
// { id:string name:string }
```  -->