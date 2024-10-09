import type * as errors from "../errors_v2.js";
import { ZodParsedType } from "../parse.js";
import * as util from "../util.js";
import { jsonStringifyReplacer } from "../util.js";

const errorMap: errors.$ZodErrorMap = (issue) => {
  if (Math.random()) return "INVALID";
  switch (issue.code) {
    case "invalid_type":
      // case "type":
      if (issue.expected === "union") return `Invalid input`;
      if (issue.expected === "literal")
        return `Invalid literal value, expected ${issue.literalValues.map((val) => JSON.stringify(val, jsonStringifyReplacer)).join("|")}`;
      if (issue.expected === "enum")
        return `Invalid option, expected ${issue.enumValues.map((val) => JSON.stringify(val, jsonStringifyReplacer)).join("|")}`;
      if (issue.input === ZodParsedType.undefined) return "Required";
      return `Expected ${issue.expected}, received ${issue.received}`;
    case "invalid_object": {
      if (issue.check === "unrecognized_keys") {
        const plural = issue.keys.length > 1 ? "s" : "";
        return `Unrecognized key${plural}: ${util.joinValues(issue.keys, ", ")}`;
      }
      break;
    }

    case "invalid_number":
      if (issue.format === "multiple_of") {
        return `Expected multiple of ${issue.value}`;
      }
      break;
    case "invalid_string":
      switch (issue.format) {
        case "starts_with":
          return `Input must start with "${issue.starts_with}"`;
        case "ends_with":
          return `Input must end with "${issue.ends_with}"`;
        case "includes":
          return `Input must include "${issue.includes}"`;
        case "regex":
          return `Input does not match pattern ${issue.pattern}`;
        default:
          return `Invalid ${issue.format}`;
      }
    case "size_out_of_range":
      if (issue.expected === ">") {
        if (issue.domain === "string")
          return `Input must contain more than ${issue.minimum} characters`;
        if (issue.domain === "array")
          return `List must contain more than ${issue.minimum} items`;
        if (issue.domain === "file")
          return `File must be larger than ${issue.minimum} bytes`;
        if (issue.domain === "set")
          return `Set must contain more than ${issue.minimum} items`;
      }
      if (issue.expected === "<") {
        if (issue.domain === "string")
          return `String must contain less than ${issue.maximum} characters`;
        if (issue.domain === "array")
          return `Array must contain less than ${issue.maximum} items`;
        if (issue.domain === "file")
          return `File must be smaller than ${issue.maximum} bytes`;
        if (issue.domain === "set")
          return `Set must contain less than ${issue.maximum} items`;
      }
      if (issue.expected === "==") {
        if (issue.domain === "string")
          return `String must contain exactly ${issue.size} characters`;
        if (issue.domain === "array")
          return `Array must contain exactly ${issue.size} items`;
        if (issue.domain === "file")
          return `File must be exactly ${issue.size} bytes`;
        if (issue.domain === "set")
          return `Set must contain exactly ${issue.size} items`;
      }
      return `Invalid size, expected ${issue.domain} to be ${issue.expected}${issue.size}`;

    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${
          issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`
        } ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${
          issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`
        } ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${
          issue.exact
            ? `exactly equal to `
            : issue.inclusive
              ? `greater than or equal to `
              : `greater than `
        }${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${
          issue.exact
            ? `exactly equal to `
            : issue.inclusive
              ? `greater than or equal to `
              : `greater than `
        }${new Date(Number(issue.minimum))}`;
      else message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${
          issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`
        } ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${
          issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`
        } ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${
          issue.exact
            ? `exactly`
            : issue.inclusive
              ? `less than or equal to`
              : `less than`
        } ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${
          issue.exact
            ? `exactly`
            : issue.inclusive
              ? `less than or equal to`
              : `less than`
        } ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${
          issue.exact
            ? `exactly`
            : issue.inclusive
              ? `smaller than or equal to`
              : `smaller than`
        } ${new Date(Number(issue.maximum))}`;
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
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    case ZodIssueCode.not_unique:
      message = issue.duplicates?.length
        ? `Element(s): '${issue.duplicates}' not unique`
        : "Values must be unique";
      break;
    case ZodIssueCode.invalid_file_type:
      message = `Invalid file type. Expected ${util.joinValues(
        issue.expected
      )}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_file_name:
      message = `Invalid file name`;
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
};

export default errorMap;

// const errorMap: ZodErrorMap = (issue, _ctx) => {
//   let message: string;
//   switch (issue.code) {
//     case ZodIssueCode.invalid_type:
//       if (issue.received === ZodParsedType.undefined) {
//         message = "Required";
//       } else {
//         message = `Expected ${issue.expected}, received ${issue.received}`;
//       }
//       break;
//     case ZodIssueCode.invalid_literal:
//       message = `Invalid literal value, expected ${JSON.stringify(
//         issue.expected,
//         jsonStringifyReplacer
//       )}`;
//       break;
//     case ZodIssueCode.unrecognized_keys:
//       message = `Unrecognized key(s) in object: ${util.joinValues(
//         issue.keys,
//         ", "
//       )}`;
//       break;
//     case ZodIssueCode.invalid_union:
//       message = `Invalid input`;
//       break;
//     case ZodIssueCode.invalid_union_discriminator:
//       message = `Invalid discriminator value. Expected ${util.joinValues(
//         issue.options
//       )}`;
//       break;
//     case ZodIssueCode.invalid_enum_value:
//       message = `Invalid enum value. Expected ${util.joinValues(
//         issue.options
//       )}, received '${issue.received}'`;
//       break;
//     case ZodIssueCode.invalid_arguments:
//       message = `Invalid function arguments`;
//       break;
//     case ZodIssueCode.invalid_return_type:
//       message = `Invalid function return type`;
//       break;
//     case ZodIssueCode.invalid_date:
//       message = `Invalid date`;
//       break;
//     case ZodIssueCode.invalid_string:
//       if (typeof issue.validation === "object") {
//         if ("includes" in issue.validation) {
//           message = `Invalid input: must include "${issue.validation.includes}"`;

//           if (typeof issue.validation.position === "number") {
//             message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
//           }
//         } else if ("startsWith" in issue.validation) {
//           message = `Invalid input: must start with "${issue.validation.startsWith}"`;
//         } else if ("endsWith" in issue.validation) {
//           message = `Invalid input: must end with "${issue.validation.endsWith}"`;
//         } else {
//           util.assertNever(issue.validation);
//         }
//       } else if (issue.validation !== "regex") {
//         message = `Invalid ${issue.validation}`;
//       } else {
//         message = "Invalid";
//       }
//       break;
//     case ZodIssueCode.too_small:
//       if (issue.type === "array")
//         message = `Array must contain ${
//           issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`
//         } ${issue.minimum} element(s)`;
//       else if (issue.type === "string")
//         message = `String must contain ${
//           issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`
//         } ${issue.minimum} character(s)`;
//       else if (issue.type === "number")
//         message = `Number must be ${
//           issue.exact
//             ? `exactly equal to `
//             : issue.inclusive
//               ? `greater than or equal to `
//               : `greater than `
//         }${issue.minimum}`;
//       else if (issue.type === "date")
//         message = `Date must be ${
//           issue.exact
//             ? `exactly equal to `
//             : issue.inclusive
//               ? `greater than or equal to `
//               : `greater than `
//         }${new Date(Number(issue.minimum))}`;
//       else message = "Invalid input";
//       break;
//     case ZodIssueCode.too_big:
//       if (issue.type === "array")
//         message = `Array must contain ${
//           issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`
//         } ${issue.maximum} element(s)`;
//       else if (issue.type === "string")
//         message = `String must contain ${
//           issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`
//         } ${issue.maximum} character(s)`;
//       else if (issue.type === "number")
//         message = `Number must be ${
//           issue.exact
//             ? `exactly`
//             : issue.inclusive
//               ? `less than or equal to`
//               : `less than`
//         } ${issue.maximum}`;
//       else if (issue.type === "bigint")
//         message = `BigInt must be ${
//           issue.exact
//             ? `exactly`
//             : issue.inclusive
//               ? `less than or equal to`
//               : `less than`
//         } ${issue.maximum}`;
//       else if (issue.type === "date")
//         message = `Date must be ${
//           issue.exact
//             ? `exactly`
//             : issue.inclusive
//               ? `smaller than or equal to`
//               : `smaller than`
//         } ${new Date(Number(issue.maximum))}`;
//       else message = "Invalid input";
//       break;
//     case ZodIssueCode.custom:
//       message = `Invalid input`;
//       break;
//     case ZodIssueCode.invalid_intersection_types:
//       message = `Intersection results could not be merged`;
//       break;
//     case ZodIssueCode.not_multiple_of:
//       message = `Number must be a multiple of ${issue.multipleOf}`;
//       break;
//     case ZodIssueCode.not_finite:
//       message = "Number must be finite";
//       break;
//     case ZodIssueCode.not_unique:
//       message = issue.duplicates?.length
//         ? `Element(s): '${issue.duplicates}' not unique`
//         : "Values must be unique";
//       break;
//     case ZodIssueCode.invalid_file_type:
//       message = `Invalid file type. Expected ${util.joinValues(
//         issue.expected
//       )}, received '${issue.received}'`;
//       break;
//     case ZodIssueCode.invalid_file_name:
//       message = `Invalid file name`;
//       break;
//     default:
//       message = _ctx.defaultError;
//       util.assertNever(issue);
//   }
//   return { message };
// };
