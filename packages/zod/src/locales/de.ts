import { type ZodErrorMap, ZodIssueCode } from "../ZodError";
import { util } from "../helpers";

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === util.ZodParsedType.undefined) {
        message = "Darf nicht leer sein";
      } else {
        message = `${issue.expected} erwartet, ${issue.received} erhalten`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Ungültiger Literalwert, ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer
      )} erwartet`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unbekannte Schlüssel im Objekt: ${util.joinValues(
        issue.keys,
        ", "
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Ungültige Eingabe`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Ungültiger Diskriminatorwert, ${util.joinValues(
        issue.options
      )} erwartet`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Ungültiger Enum-Wert. ${util.joinValues(
        issue.options
      )} erwartet, '${issue.received}' erhalten`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Ungültige Funktionsargumente`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Ungültiger Funktionsrückgabewert`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Ungültiges Datum`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Ungültige Eingabe: muss "${issue.validation.includes}" enthalten`;
          if (typeof issue.validation.position === "number") {
            message = `${message} an einer oder mehreren Positionen größer oder gleich ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Ungültige Eingabe: muss mit "${issue.validation.startsWith}" beginnen`;
        } else if ("endsWith" in issue.validation) {
          message = `Ungültige Eingabe: muss mit "${issue.validation.endsWith}" enden`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Ungültige ${issue.validation}`;
      } else {
        message = "Ungültig";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array muss ${
          issue.exact ? "genau" : issue.inclusive ? `mindestens` : `mehr als`
        } ${issue.minimum} Element(e) enthalten`;
      else if (issue.type === "string")
        message = `String muss ${
          issue.exact ? "genau" : issue.inclusive ? `mindestens` : `mehr als`
        } ${issue.minimum} Zeichen enthalten`;
      else if (issue.type === "number")
        message = `Zahl muss ${
          issue.exact
            ? `genau`
            : issue.inclusive
              ? `größer oder gleich`
              : `größer als`
        } ${issue.minimum} sein`;
      else if (issue.type === "date")
        message = `Datum muss ${
          issue.exact
            ? `genau`
            : issue.inclusive
              ? `größer oder gleich`
              : `größer als`
        } ${new Date(Number(issue.minimum))} sein`;
      else message = "Ungültige Eingabe";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array muss ${
          issue.exact ? `genau` : issue.inclusive ? `höchstens` : `weniger als`
        } ${issue.maximum} Element(e) enthalten`;
      else if (issue.type === "string")
        message = `String muss ${
          issue.exact ? `genau` : issue.inclusive ? `höchstens` : `weniger als`
        } ${issue.maximum} Zeichen enthalten`;
      else if (issue.type === "number")
        message = `Zahl muss ${
          issue.exact
            ? `genau`
            : issue.inclusive
              ? `kleiner oder gleich`
              : `kleiner als`
        } ${issue.maximum} sein`;
      else if (issue.type === "bigint")
        message = `Bigint muss ${
          issue.exact
            ? `genau`
            : issue.inclusive
              ? `kleiner oder gleich`
              : `kleiner als`
        } ${issue.maximum} sein`;
      else if (issue.type === "date")
        message = `Datum muss ${
          issue.exact
            ? `genau`
            : issue.inclusive
              ? `kleiner oder gleich`
              : `kleiner als`
        } ${new Date(Number(issue.maximum))} sein`;
      else message = "Ungültige Eingabe";
      break;
    case ZodIssueCode.custom:
      message = `Ungültige Eingabe`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Schnittmengenergebnisse konnten nicht zusammengeführt werden`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Zahl muss ein Vielfaches von ${issue.multipleOf} sein`;
      break;
    case ZodIssueCode.not_finite:
      message = "Zahl muss endlich sein";
      break;
    case ZodIssueCode.uniqueness:
      message = issue.duplicateElements?.length
        ? `Element(e): '${issue.duplicateElements}' nicht eindeutig`
        : "Werte müssen eindeutig sein";
      break;
    case ZodIssueCode.invalid_file_type:
      message = `Ungültiger Dateityp. ${util.joinValues(
        issue.expected
      )} erwartet, '${issue.received}' erhalten`;
      break;
    case ZodIssueCode.invalid_file_name:
      message = `Ungültiger Dateiname`;
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export default errorMap;
