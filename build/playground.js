"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const z = require(".");
// const STATUSES = ['Assigned', 'In Progress', 'On Location', 'Succeeded', 'Failed'] as const;
// const literals = STATUSES.map(z.literal);
// // const StatusSchema = z.union(STATUSES.map(z.literal));
// const StatusSchema2 = z.enum(STATUSES);
// const StatusSchema3 = z.enum(['Assigned', 'In Progress', 'On Location', 'Succeeded', 'Failed']);
// const asdf = StatusSchema3.OptionsArray;
// const asdf = Object.values(StatusSchema3.Values);
// StatusSchema3._def.values;
// StatusSchema3.Values;
// type StatusSchema2 = z.infer<typeof StatusSchema2>
// const fishTypes = ['Salmon', 'Tuna', 'Trout'] as const;
// const FishEnum = z.enum(fishTypes);
const $Cat = z.object({
    name: z.literal('Cat'),
    ability: z.literal('meow'),
});
const $Dog = z.object({
    name: z.literal('Dog'),
    ability: z.literal('bark'),
});
const $Animal = z.union([$Cat, $Dog]);
const $AnimalAbility = z.generic($Animal, (t) => t._shape.ability);
//# sourceMappingURL=playground.js.map