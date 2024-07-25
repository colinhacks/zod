import { type ZodErrorMap, ZodIssueCode } from "../errors.js";
import { ZodParsedType } from "../parse.js";
import * as util from "../util.js";

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Requerido";
      } else {
        message = `Se esperaba ${issue.expected}, se recibió ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Valor literal inválido, se esperaba ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Llave(s) no reconocida(s) en el objeto: ${util.joinValues(
        issue.keys,
        ", "
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Entrada inválida`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Valor discriminador inválido. Se esperaba ${util.joinValues(
        issue.options
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Valor inválido. Se esperaba ${util.joinValues(
        issue.options
      )}, se recibió '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Argumentos de función inválidos`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Tipo de retorno de función inválido`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Fecha inválida`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Entrada inválida: debe incluir "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} en una o más posiciones mayores o iguales a ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Entrada inválida: debe comenzar con "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Entrada inválida: debe finalizar con "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `${issue.validation} inválido`;
      } else {
        message = "Inválido";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `La lista debe contener ${
          issue.exact ? "exactamente" : issue.inclusive ? `al menos` : `más de`
        } ${issue.minimum} elemento(s)`;
      else if (issue.type === "string")
        message = `El texto debe contener ${
          issue.exact ? "exactamente" : issue.inclusive ? `al menos` : `más de`
        } ${issue.minimum} carácter(es)`;
      else if (issue.type === "number")
        message = `El número debe ser ${
          issue.exact
            ? `exactamente`
            : issue.inclusive
              ? `mayor o igual a`
              : `mayor que`
        } ${issue.minimum}`;
      else if (issue.type === "date")
        message = `La fecha debe ser ${
          issue.exact
            ? `exactamente`
            : issue.inclusive
              ? `mayor o igual al`
              : `mayor que el`
        } ${new Date(Number(issue.minimum))}`;
      else message = "Entrada inválida";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `La lista debe contener ${
          issue.exact
            ? `exactamente`
            : issue.inclusive
              ? `como máximo`
              : `menos que`
        } ${issue.maximum} elemento(s)`;
      else if (issue.type === "string")
        message = `El texto debe contener ${
          issue.exact
            ? `exactamente`
            : issue.inclusive
              ? `como máximo`
              : `menos de`
        } ${issue.maximum} carácter(es)`;
      else if (issue.type === "number")
        message = `El número debe ser ${
          issue.exact
            ? `exactamente`
            : issue.inclusive
              ? `menor o igual a`
              : `menor que`
        } ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `El entero grande debe ser ${
          issue.exact
            ? `exactamente`
            : issue.inclusive
              ? `menor o igual a`
              : `menor que`
        } ${issue.maximum}`;
      else if (issue.type === "date")
        message = `La fecha debe ser ${
          issue.exact
            ? `exactamente`
            : issue.inclusive
              ? `menor o igual al`
              : `menor que el`
        } ${new Date(Number(issue.maximum))}`;
      else message = "Entrada inválida";
      break;
    case ZodIssueCode.custom:
      message = `Entrada inválida`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Valores de intersección no pudieron ser mezclados`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Número debe ser múltiplo de ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Número no puede ser infinito";
      break;
    case ZodIssueCode.uniqueness:
      message = issue.duplicateElements?.length
        ? `Elemento(s): '${issue.duplicateElements}' no son únicos`
        : "Los valores deben ser únicos";
      break;
    case ZodIssueCode.invalid_file_type:
      message = `Tipo de archivo inválido. Se esperaba ${util.joinValues(
        issue.expected
      )}, se recibió '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_file_name:
      message = `Nombre de archivo inválido`;
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export default errorMap;
