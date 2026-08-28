import typia from "typia";

interface Fixture {
  number: number;
  negNumber: number;
  maxNumber: number;
  string: string;
  longString: string;
  boolean: boolean;
  deeplyNested: {
    foo: string;
    num: number;
    bool: boolean;
  };
}

export const is = typia.createIs<Fixture>();
export const equals = typia.createEquals<Fixture>();
export const clone = typia.misc.createClone<Fixture>();
