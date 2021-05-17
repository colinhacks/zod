// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { Mocker } from "./Mocker";

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
