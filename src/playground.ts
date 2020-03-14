import * as z from '.';

const MyEnum = z.enum([z.literal('Hello'), z.literal('There'), z.literal('Bobby')]);
MyEnum.parse('Bobby');
