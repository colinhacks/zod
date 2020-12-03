// @ts-ignore TS6133
import { expect } from 'https://deno.land/x/expect@v0.2.6/mod.ts';
const test = Deno.test;

import * as z from '../index.ts';

const minFive = z.number().min(5, 'min5');
const maxFive = z.number().max(5, 'max5');
const intNum = z.number().int();

test('passing validations', () => {
  minFive.parse(5);
  minFive.parse(6);
  maxFive.parse(5);
  maxFive.parse(4);
  intNum.parse(4);
});

test('failing validations', () => {
  expect(() => minFive.parse(4)).toThrow();
  expect(() => maxFive.parse(6)).toThrow();
  expect(() => intNum.parse(3.14)).toThrow();
});

test('parse NaN', () => {
  expect(() => z.number().parse(NaN)).toThrow();
});
