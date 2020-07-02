import * as z from '.';
import { ZodErrorCode } from './ZodError';
import { ErrorMap } from './errorMap';

interface Category {
  name: string;
  subcategories: Category[];
}

const Category: z.toZod<Category> = z.lazy.object(() => ({
  name: z.string(),
  subcategories: z.array(Category),
}));

const errorMap: ErrorMap = (error, ctx) => {
  if (error.code === ZodErrorCode.invalid_type) {
    if (error.expected === 'string') {
      return "This ain't no string!";
    }
  }
  if (error.code === ZodErrorCode.custom_error) {
    return JSON.stringify(error.params, null, 2);
  }
  return ctx.defaultError;
};
errorMap;
try {
  const checker = z.function(z.tuple([z.string()]), z.boolean()).implement(arg => {
    return arg.length as any;
  });
  checker('12' as any);

  // z.string()
  //   .refinement({
  //     check: val => val.length > 12,
  //     // params: { test: 15 },
  //     message: 'Override!',
  //   })
  //   .parse('asdf', { errorMap });
} catch (err) {
  console.log(JSON.stringify(err.errors, null, 2));
}

try {
  const validationSchema = z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, 'Both password and confirmation must match');

  validationSchema.parse({
    firstName: 'zod',
    lastName: '',
    email: 'theba@zod.c',
    password: 'thetetathea',
    confirmPassword: 'thethtbet',
  });
} catch (err) {
  console.log(JSON.stringify(err.errors, null, 2));
}

// z.number().parse('12', { errorMap });

// interface Category {
//   name: string;
//   subcategories: Category[];
// }

// const y = z.lazy(()=>z.string());

// const Category: z.lazyobject<Category> = z.lazy.object(() => ({
//   name: z.string(),
//   subcategories: z.array(Category),
// }));

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
