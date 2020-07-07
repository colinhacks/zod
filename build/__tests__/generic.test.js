"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const z = require("..");
const $Cat = z.object({
    type: z.literal('cat'),
    ability: z.literal('meow'),
});
const $Dog = z.object({
    type: z.literal('dog'),
    ability: z.literal('bark'),
});
const $Animal = z.union([$Cat, $Dog]);
const $AnimalAbility = z.generic($Animal, (t) => t._shape.ability);
test('Setup', () => {
    expect($Cat);
    expect($Dog);
    expect($Animal);
    expect($AnimalAbility);
    const t1 = true;
    expect(t1).toBeTruthy();
    const t2 = true;
    expect(t2).toBeTruthy();
});
test('Valid Generic Parse 1', () => {
    const animal = {
        type: 'cat',
        ability: 'meow',
    };
    const parsedAnimal = $Animal.parse(animal);
    expect(parsedAnimal).toStrictEqual({
        type: 'cat',
        ability: 'meow',
    });
});
test('Valid Generic Parse 2', () => {
    const animal = {
        type: 'dog',
        ability: 'bark',
    };
    const parsedAnimal = $Animal.parse(animal);
    expect(parsedAnimal).toStrictEqual({
        type: 'dog',
        ability: 'bark',
    });
});
test('Invalid Generic Parse 1', () => {
    const animal = {
        type: 'dog',
        ability: 'bark',
        extra: true,
    };
    expect(() => $Animal.parse(animal)).toThrow();
});
test('Invalid Generic Parse 2', () => {
    const animal = {
        type: 'dog',
        ability: 'play',
    };
    expect(() => $Animal.parse(animal)).toThrow();
});
test('Invalid Generic Parse 3', () => {
    const animal = {
        ability: 'bark',
    };
    expect(() => $Animal.parse(animal)).toThrow();
});
test('Invalid Generic Parse 4', () => {
    const animal = {
        type: 'cat',
    };
    expect(() => $Animal.parse(animal)).toThrow();
});
//# sourceMappingURL=generic.test.js.map