import { MakeErrorData } from "../../parser/make-error-data";

export type RefinementCtx = {
  addIssue: (arg: MakeErrorData) => void;
  path: (string | number)[];
};
