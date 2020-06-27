import * as z from '.';

interface Category {
  name: string;
  subcategories: Category[];
}

// const y = z.lazy(()=>z.string());

const Category: z.lazyobject<Category> = z.lazy.object(() => ({
  name: z.string(),
  subcategories: z.array(Category),
}));

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
