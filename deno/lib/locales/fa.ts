import { util, ZodErrorMap, ZodIssueCode, ZodParsedType } from "../index.ts";

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "الزامی است";
      } else {
        message = `مورد انتظار ${issue.expected}، دریافت شد ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `مقدار حرفه‌ای نامعتبر، مورد انتظار ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `کلید یا کلیدهای نامشخص در شی: ${util.joinValues(
        issue.keys,
        ", "
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `ورودی نامعتبر است`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `مقدار شناسه‌گذار نامعتبر. مورد انتظار ${util.joinValues(
        issue.options
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `مقدار شناسه‌گذاری نامعتبر. مورد انتظار ${util.joinValues(
        issue.options
      )}, دریافت شده '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `آرگومان‌های تابع نامعتبر است`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `نوع بازگشتی تابع نامعتبر است`;
      break;
    case ZodIssueCode.invalid_date:
      message = `تاریخ نامعتبر است`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `ورودی نامعتبر: باید شامل "${issue.validation.includes}" باشد`;

          if (typeof issue.validation.position === "number") {
            message = `${message} در یک یا چند جایگاه بیشتر یا مساوی ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `ورودی نامعتبر: باید با "${issue.validation.startsWith}" شروع شود`;
        } else if ("endsWith" in issue.validation) {
          message = `ورودی نامعتبر: باید با "${issue.validation.endsWith}" پایان یابد`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `نامعتبر ${issue.validation}`;
      } else {
        message = "نامعتبر";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `آرایه باید شامل ${
          issue.exact ? "دقیقا" : issue.inclusive ? `حداقل` : `بیشتر از`
        } ${issue.minimum} عنصر باشد`;
      else if (issue.type === "string")
        message = `رشته باید شامل ${
          issue.exact ? "دقیقا" : issue.inclusive ? `حداقل` : `بیشتر از`
        } ${issue.minimum} نویسه باشد`;
      else if (issue.type === "number")
        message = `عدد باید ${
          issue.exact
            ? `دقیقا برابر با `
            : issue.inclusive
            ? `بزرگتر یا مساوی با `
            : `بزرگتر از `
        }${issue.minimum} باشد`;
      else if (issue.type === "date")
        message = `تاریخ باید ${
          issue.exact
            ? `دقیقا برابر با `
            : issue.inclusive
            ? `بزرگتر یا مساوی با `
            : `بزرگتر از `
        }${new Date(Number(issue.minimum))} باشد`;
      else message = "ورودی نامعتبر است";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `آرایه باید شامل ${
          issue.exact ? `دقیقا` : issue.inclusive ? `حداکثر` : `کمتر از`
        } ${issue.maximum} عنصر باشد`;
      else if (issue.type === "string")
        message = `رشته باید شامل ${
          issue.exact ? `دقیقا` : issue.inclusive ? `حداکثر` : `کمتر از`
        } ${issue.maximum} نویسه باشد`;
      else if (issue.type === "number")
        message = `عدد باید ${
          issue.exact
            ? `دقیقا`
            : issue.inclusive
            ? `کمتر یا مساوی با`
            : `کمتر از`
        } ${issue.maximum} باشد`;
      else if (issue.type === "bigint")
        message = `BigInt باید ${
          issue.exact
            ? `دقیقا`
            : issue.inclusive
            ? `کمتر یا مساوی با`
            : `کمتر از`
        } ${issue.maximum} باشد`;
      else if (issue.type === "date")
        message = `تاریخ باید ${
          issue.exact
            ? `دقیقا`
            : issue.inclusive
            ? `کوچکتر یا مساوی با`
            : `کوچکتر از`
        } ${new Date(Number(issue.maximum))} باشد`;
      else message = "ورودی نامعتبر است";
      break;
    case ZodIssueCode.custom:
      message = `ورودی نامعتبر است`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `نتایج تقاطع قابل ترکیب نیستند`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `عدد باید ضریبی از ${issue.multipleOf} باشد`;
      break;
    case ZodIssueCode.not_finite:
      message = "عدد باید محدود باشد";
      break;
    case ZodIssueCode.uniqueness:
      message = `عناصر تکراری`;
      break;
    case ZodIssueCode.invalid_file_type:
      message = `نوع فایل نامعتبر. مورد انتظار ${util.joinValues(
        issue.expected
      )}, دریافت شده '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_file_name:
      message = `نام فایل نامعتبر`;
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export default errorMap;
