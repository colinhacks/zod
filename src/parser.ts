import { defaultErrorMap, ZodErrorMap } from "./defaultErrorMap";
import { objectUtil } from "./helpers/objectUtil";
import { ZodParsedType } from "./helpers/parseUtil";
import { MakeErrorData, ZodError } from "./ZodError";

export const issueHelpers = (error: ZodError, params: ParseParams) => {
  const makeIssue = (errorData: MakeErrorData) => {
    const errorArg = {
      ...errorData,
      path: [...params.path, ...(errorData.path || [])],
    };

    const defaultError =
      defaultErrorMap === params.errorMap
        ? { message: `Invalid value.` }
        : defaultErrorMap(errorArg, {
            data: params.data,
            defaultError: `Invalid value.`,
          });
    const issue = {
      ...errorData,
      path: [...params.path, ...(errorData.path || [])],
      message:
        errorData.message ||
        params.errorMap(errorArg, {
          data: params.data,
          defaultError: defaultError.message,
        }).message,
    };

    return issue;
  };
  const addIssue = (errorData: MakeErrorData) => {
    const issue = makeIssue(errorData);
    error.addIssue(issue);
  };

  return {
    makeIssue,
    addIssue,
  };
};

export type ParseParams = {
  data: any;
  path: (string | number)[];
  errorMap: ZodErrorMap;
  parentError: ZodError;
  async: boolean;
};

export type ParseParamsWithOptionals = objectUtil.flatten<
  Partial<ParseParams> & { data: any }
>;

export type ParseParamsNoData = Omit<ParseParams, "data">;

export type ParseContext = ParseParams &
  ReturnType<typeof issueHelpers> & {
    parsedType: ZodParsedType;
    currentError: ZodError;
  };

export type ZodParserReturnPayload<T> =
  | {
      success: false;
      error: ZodError;
    }
  | {
      success: true;
      data: T;
    };

export type ZodParserReturnType<T> =
  | ZodParserReturnPayload<T>
  | Promise<ZodParserReturnPayload<T>>;
