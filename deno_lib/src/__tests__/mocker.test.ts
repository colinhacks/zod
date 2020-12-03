// @ts-ignore TS6133
import {
  describe,
  expect,
  test,
} from 'https://deno.land/x/expect@v0.2.6/mod.ts';

import { Mocker } from '../helpers/Mocker.ts';

test('mocker', () => {
  const mocker = new Mocker();
  mocker.string;
  mocker.number;
  mocker.boolean;
  mocker.null;
  mocker.undefined;
  mocker.stringOptional;
  mocker.stringNullable;
  mocker.numberOptional;
  mocker.numberNullable;
  mocker.booleanOptional;
  mocker.booleanNullable;
});
