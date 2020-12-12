import { util } from "../helpers/util";
import { ZodIssueOptionalMessage } from "../ZodError";

type stripPath<T extends object> = T extends any
  ? util.OmitKeys<T, "path">
  : never;

export type MakeErrorData = stripPath<ZodIssueOptionalMessage> & {
  path?: (string | number)[];
};
