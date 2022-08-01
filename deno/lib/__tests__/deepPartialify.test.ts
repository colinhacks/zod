// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

const assertSerializeEqual = (x: any, y: any) => {
    expect(JSON.stringify(x)).toStrictEqual(JSON.stringify(y))
}

test('Deep Partial on primitives', () => {
    assertSerializeEqual(
        z.deepPartialify(z.object({
        s: z.string(),
        n: z.number(),
        i: z.bigint(),
        b: z.boolean(),
        z: z.null(),
        u: z.undefined(),
        })),
        z.object({
            s: z.string().optional(),
            n: z.number().optional(),
            i: z.bigint().optional(),
            b: z.boolean().optional(),
            z: z.null().optional(),
            u: z.undefined().optional(),
        })
    )
})

test('Test Union', () => {
    assertSerializeEqual(
        z.deepPartialify(
            z.union([
                z.object({s: z.string()}),
                z.object({n: z.number()}),
            ])
        ),
        z.union([
            z.object({s: z.string().optional()}),
            z.object({n: z.number().optional()}),
        ])
    )
})

test('Test Discriminated Union', () => {
    assertSerializeEqual(
        z.deepPartialify(
            z.discriminatedUnion('t', [
                z.object({t: z.literal('s1'), s: z.string()}),
                z.object({t: z.literal('n1'), n: z.number()}),
            ])
        ),
        z.discriminatedUnion('t', [
            z.object({t: z.literal('s1'), s: z.string().optional()}),
            z.object({t: z.literal('n1'), n: z.number().optional()}),
        ])
    )
})
