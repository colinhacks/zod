// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { Mocker } from "./Mocker.ts";

test("mocker", () => {
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
