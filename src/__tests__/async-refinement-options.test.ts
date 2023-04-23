// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from '../index'

const delay = async (ms: number) => new Promise((resolve) => setTimeout(() => resolve(true), ms))

test("will AsyncRefinementOptions fail if not called async", () => {
  const superRefineSchema = z.string().superRefine(async () => {}, { cache: true })
  try {
    superRefineSchema.safeParse("asdf");
  } catch (err) {
    const zerr: z.ZodError = err as any;

    expect(zerr.message).toEqual("Async refinement options (cache) encountered during synchronous parse operation. Use .parseAsync instead.");
  }

  const transformSchema = z.string().transform(async (val) => val, { cache: true, debounce: { ms: 10 }, supersede: true })
  try {
    transformSchema.safeParse("asdf");
  } catch (err) {
    const zerr: z.ZodError = err as any;

    expect(zerr.message).toEqual("Async transform options (cache, debounce, supersede) encountered during synchronous parse operation. Use .parseAsync instead.");
  }
})

// SUPERREFINE TESTS

test("SuperRefine AsyncRefinementOptions cache", async () => {
  let superRefineCallCount = 0
  const schema = z.string()
    .superRefine(async () => {
      superRefineCallCount++
    }, { cache: true })

  superRefineCallCount = 0
  await schema.safeParseAsync("Test")
  expect(superRefineCallCount).toEqual(1)

  superRefineCallCount = 0
  await schema.safeParseAsync("Test")
  expect(superRefineCallCount).toEqual(0)
})

test("SuperRefine AsyncRefinementOptions supersede", async () => {
  const schema = (supersede: boolean) => z.string().superRefine(async (val, ctx) => {
    await delay(parseInt(val))
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Resolved after ${val}ms`
    })
  }, { supersede })

  const defaultSchema = schema(false)
  const supersedeSchema = schema(true)

  const defaultPass1 = defaultSchema.safeParseAsync('50')
  const defaultPass2 = defaultSchema.safeParseAsync('0')
  const [defaultPass1Response, defaultPass2Response] = await Promise.all([defaultPass1, defaultPass2])

  expect(defaultPass1Response.success).toEqual(false)
  expect(defaultPass2Response.success).toEqual(false)
  if (!defaultPass1Response.success) expect(defaultPass1Response.error.issues[0].message).toEqual('Resolved after 50ms')
  if (!defaultPass2Response.success) expect(defaultPass2Response.error.issues[0].message).toEqual('Resolved after 0ms')

  const supersedePass1 = supersedeSchema.safeParseAsync('50')
  const supersedePass2 = supersedeSchema.safeParseAsync('0')
  const [supersedePass1Response, supersedePass2Response] = await Promise.all([supersedePass1, supersedePass2])

  expect(supersedePass1Response.success).toEqual(false)
  expect(supersedePass2Response.success).toEqual(false)
  if (!supersedePass1Response.success) expect(supersedePass1Response.error.issues[0].message).toEqual('Resolved after 0ms')
  if (!supersedePass2Response.success) expect(supersedePass2Response.error.issues[0].message).toEqual('Resolved after 0ms')
})

test("SuperRefine AsyncRefinementOptions debounce", async () => {
  let asyncCallCount = 0

  const schema = (debounce?: { ms: number }) => z.string()
  .superRefine(async () => {
    asyncCallCount++
    await delay(50)
  }, { debounce })

  const defaultSchema = schema()
  asyncCallCount = 0

  const defaultPass1 = defaultSchema.safeParseAsync('1')
  const defaultPass2 = defaultSchema.safeParseAsync('2')
  const defaultPass3 = defaultSchema.safeParseAsync('3')
  const defaultPass4 = defaultSchema.safeParseAsync('4')
  const [defaultRes1, defaultRes2, defaultRes3, defaultRes4] = await Promise.all([defaultPass1, defaultPass2, defaultPass3, defaultPass4])

  expect(defaultRes1.success).toEqual(true)
  if (defaultRes1.success) expect(defaultRes1.data).toEqual('1')
  expect(defaultRes2.success).toEqual(true)
  if (defaultRes2.success) expect(defaultRes2.data).toEqual('2')
  expect(defaultRes3.success).toEqual(true)
  if (defaultRes3.success) expect(defaultRes3.data).toEqual('3')
  expect(defaultRes4.success).toEqual(true)
  if (defaultRes4.success) expect(defaultRes4.data).toEqual('4')
  
  expect(asyncCallCount).toEqual(4)

  const debouncedSchema = schema({ ms: 50 })
  await debouncedSchema.safeParseAsync("0") // Seed the cache
  
  asyncCallCount = 0
  const debouncedPass1 = debouncedSchema.safeParseAsync('1')
  const debouncedPass2 = debouncedSchema.safeParseAsync('2')
  const debouncedPass3 = debouncedSchema.safeParseAsync('3')
  const debouncedPass4 = debouncedSchema.safeParseAsync('4')
  const [debouncedRes1, debouncedRes2, debouncedRes3, debouncedRes4] = await Promise.all([debouncedPass1, debouncedPass2, debouncedPass3, debouncedPass4])

  expect(debouncedRes1.success).toEqual(true)
  if (debouncedRes1.success) expect(debouncedRes1.data).toEqual('0')
  expect(debouncedRes2.success).toEqual(true)
  if (debouncedRes2.success) expect(debouncedRes2.data).toEqual('0')
  expect(debouncedRes3.success).toEqual(true)
  if (debouncedRes3.success) expect(debouncedRes3.data).toEqual('0')
  expect(debouncedRes4.success).toEqual(true)
  if (debouncedRes4.success) expect(debouncedRes4.data).toEqual('4')

  expect(asyncCallCount).toEqual(1)
})

test("SuperRefine AsyncRefinementOptions cache and debounce", async () => {
  let asyncCallCount = 0
  const schema = z.string()
    .superRefine(async () => {
      asyncCallCount++
      await delay(50)
    }, { cache: true, debounce: { ms: 500 } })

  // Debounce
  const pass0 = schema.safeParseAsync('1')
  const pass1 = schema.safeParseAsync('2')
  const pass2 = schema.safeParseAsync('3')
  const pass3 = schema.safeParseAsync('4')
  await Promise.all([pass0, pass1, pass2, pass3])
  expect(asyncCallCount).toEqual(1)

  // Cache
  await schema.safeParseAsync('4')
  expect(asyncCallCount).toEqual(1)
})

test("SuperRefine AsyncRefinementOptions cache and supersede", async () => {
  let asyncCallCount = 0
  const schema = z.string()
    .superRefine(async (val, ctx) => {
      asyncCallCount++
      await delay(parseInt(val))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Resolved after ${val}ms`
      })
    }, { cache: true, supersede: true })

  // Supersede
  const supersedePass1 = schema.safeParseAsync('50')
  const supersedePass2 = schema.safeParseAsync('0')
  const [supersedePass1Response, supersedePass2Response] = await Promise.all([supersedePass1, supersedePass2])

  expect(supersedePass1Response.success).toEqual(false)
  expect(supersedePass2Response.success).toEqual(false)
  if (!supersedePass1Response.success) expect(supersedePass1Response.error.issues[0].message).toEqual('Resolved after 0ms')
  if (!supersedePass2Response.success) expect(supersedePass2Response.error.issues[0].message).toEqual('Resolved after 0ms')
  expect(asyncCallCount).toEqual(2)

  // Cache
  const supersedePass3Response = await schema.safeParseAsync('0')
  expect(supersedePass3Response.success).toEqual(false)
  if (!supersedePass3Response.success) expect(supersedePass3Response.error.issues[0].message).toEqual('Resolved after 0ms')
  expect(asyncCallCount).toEqual(2)
})

// TRANSFORM TESTS

test("Transform AsyncRefinementOptions cache", async () => {
  let transformCallCount = 0
  const schema = z.string()
    .transform(async (val) => {
      transformCallCount++
      return `transformed ${val}`
    }, { cache: true })

  transformCallCount = 0
  await schema.safeParseAsync("Test")
  expect(transformCallCount).toEqual(1)

  transformCallCount = 0
  await schema.safeParseAsync("Test")
  expect(transformCallCount).toEqual(0)
})

test("Transform AsyncRefinementOptions supersede", async () => {
  const schema = (supersede: boolean) => z.string().transform(async (val) => {
    await delay(parseInt(val))
    return `Resolved after ${val}ms`
  }, { supersede })

  const defaultSchema = schema(false)
  const supersedeSchema = schema(true)

  const defaultPass1 = defaultSchema.safeParseAsync('50')
  const defaultPass2 = defaultSchema.safeParseAsync('0')
  const [defaultPass1Response, defaultPass2Response] = await Promise.all([defaultPass1, defaultPass2])

  expect(defaultPass1Response.success).toEqual(true)
  expect(defaultPass2Response.success).toEqual(true)
  if (defaultPass1Response.success) expect(defaultPass1Response.data).toEqual('Resolved after 50ms')
  if (defaultPass2Response.success) expect(defaultPass2Response.data).toEqual('Resolved after 0ms')

  const supersedePass1 = supersedeSchema.safeParseAsync('50')
  const supersedePass2 = supersedeSchema.safeParseAsync('0')
  const [supersedePass1Response, supersedePass2Response] = await Promise.all([supersedePass1, supersedePass2])

  expect(supersedePass1Response.success).toEqual(true)
  expect(supersedePass2Response.success).toEqual(true)
  if (supersedePass1Response.success) expect(supersedePass1Response.data).toEqual('Resolved after 0ms')
  if (supersedePass2Response.success) expect(supersedePass2Response.data).toEqual('Resolved after 0ms')
})

test("Transform AsyncRefinementOptions debounce", async () => {
  let asyncCallCount = 0

  const schema = (debounce?: { ms: number }) => z.string()
  .transform(async (val) => {
    asyncCallCount++
    await delay(50)
    return `transformed ${val}`
  }, { debounce })

  const defaultSchema = schema()
  asyncCallCount = 0

  const defaultPass1 = defaultSchema.safeParseAsync('1')
  const defaultPass2 = defaultSchema.safeParseAsync('2')
  const defaultPass3 = defaultSchema.safeParseAsync('3')
  const defaultPass4 = defaultSchema.safeParseAsync('4')
  const [defaultRes1, defaultRes2, defaultRes3, defaultRes4] = await Promise.all([defaultPass1, defaultPass2, defaultPass3, defaultPass4])

  expect(defaultRes1.success).toEqual(true)
  if (defaultRes1.success) expect(defaultRes1.data).toEqual('transformed 1')
  expect(defaultRes2.success).toEqual(true)
  if (defaultRes2.success) expect(defaultRes2.data).toEqual('transformed 2')
  expect(defaultRes3.success).toEqual(true)
  if (defaultRes3.success) expect(defaultRes3.data).toEqual('transformed 3')
  expect(defaultRes4.success).toEqual(true)
  if (defaultRes4.success) expect(defaultRes4.data).toEqual('transformed 4')
  
  expect(asyncCallCount).toEqual(4)

  const debouncedSchema = schema({ ms: 50 })
  await debouncedSchema.safeParseAsync("0") // Seed the cache
  
  asyncCallCount = 0
  const debouncedPass1 = debouncedSchema.safeParseAsync('1')
  const debouncedPass2 = debouncedSchema.safeParseAsync('2')
  const debouncedPass3 = debouncedSchema.safeParseAsync('3')
  const debouncedPass4 = debouncedSchema.safeParseAsync('4')
  const [debouncedRes1, debouncedRes2, debouncedRes3, debouncedRes4] = await Promise.all([debouncedPass1, debouncedPass2, debouncedPass3, debouncedPass4])

  expect(debouncedRes1.success).toEqual(true)
  if (debouncedRes1.success) expect(debouncedRes1.data).toEqual('transformed 0')
  expect(debouncedRes2.success).toEqual(true)
  if (debouncedRes2.success) expect(debouncedRes2.data).toEqual('transformed 0')
  expect(debouncedRes3.success).toEqual(true)
  if (debouncedRes3.success) expect(debouncedRes3.data).toEqual('transformed 0')
  expect(debouncedRes4.success).toEqual(true)
  if (debouncedRes4.success) expect(debouncedRes4.data).toEqual('transformed 4')

  expect(asyncCallCount).toEqual(1)
})

test("Transform AsyncRefinementOptions cache and debounce", async () => {
  let asyncCallCount = 0
  const schema = z.string()
    .transform(async (val) => {
      asyncCallCount++
      await delay(50)
      return `transformed ${val}`
    }, { cache: true, debounce: { ms: 50 } })

  // Debounce
  const pass1 = schema.safeParseAsync('1')
  const pass2 = schema.safeParseAsync('2')
  const pass3 = schema.safeParseAsync('3')
  const pass4 = schema.safeParseAsync('4')
  const [_res1, _res2, _res3, res4] = await Promise.all([pass1, pass2, pass3, pass4])
  expect(asyncCallCount).toEqual(1)
  expect(res4.success).toEqual(true)
  if (res4.success) expect(res4.data).toEqual('transformed 4')

  // Cache
  const res5 = await schema.safeParseAsync('4')
  expect(asyncCallCount).toEqual(1)
  expect(res5.success).toEqual(true)
  if (res5.success) expect(res5.data).toEqual('transformed 4')
})

test("Transform AsyncRefinementOptions cache and supersede", async () => {
  let asyncCallCount = 0
  const schema = z.string()
    .transform(async (val) => {
      asyncCallCount++
      await delay(parseInt(val))
      return `Resolved after ${val}ms`
    }, { cache: true, supersede: true })

  // Supersede
  const supersedePass1 = schema.safeParseAsync('50')
  const supersedePass2 = schema.safeParseAsync('0')
  const [supersedePass1Response, supersedePass2Response] = await Promise.all([supersedePass1, supersedePass2])

  expect(supersedePass1Response.success).toEqual(true)
  expect(supersedePass2Response.success).toEqual(true)
  if (supersedePass1Response.success) expect(supersedePass1Response.data).toEqual('Resolved after 0ms')
  if (supersedePass2Response.success) expect(supersedePass2Response.data).toEqual('Resolved after 0ms')
  expect(asyncCallCount).toEqual(2)

  // Cache
  const supersedePass3Response = await schema.safeParseAsync('0')
  expect(supersedePass3Response.success).toEqual(true)
  if (supersedePass3Response.success) expect(supersedePass3Response.data).toEqual('Resolved after 0ms')
  expect(asyncCallCount).toEqual(2)
})