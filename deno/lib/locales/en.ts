import { util, ZodParsedType } from "../helpers/util.ts";
import { ZodErrorMap, ZodIssueCode } from "../ZodError.ts";

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(
        issue.keys,
        ", "
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(
        issue.options
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(
        issue.options
      )}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${
          issue.inclusive ? `at least` : `more than`
        } ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${
          issue.inclusive ? `at least` : `over`
        } ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be greater than ${
          issue.inclusive ? `or equal to ` : ``
        }${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be greater than ${
          issue.inclusive ? `or equal to ` : ``
        }${new Date(issue.minimum)}`;
      else message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${
          issue.inclusive ? `at most` : `less than`
        } ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${
          issue.inclusive ? `at most` : `under`
        } ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be less than ${
          issue.inclusive ? `or equal to ` : ``
        }${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be smaller than ${
          issue.inclusive ? `or equal to ` : ``
        }${new Date(issue.maximum)}`;
      else message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export default errorMap;
