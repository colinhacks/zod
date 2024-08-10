import { type ZodErrorMap, ZodIssueCode } from "../errors.js";
import { ZodParsedType } from "../parse.js";
import * as util from "../util.js";

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Obrigatório";
      } else {
        message = `O dado deve ser do tipo ${issue.expected}, porém foi enviado ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Valor literal inválido, era esperado ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Chave(s) não reconhecida(s) no objeto: ${util.joinValues(
        issue.keys,
        ", "
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Entrada inválida`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Valor discriminador inválido. Foi esperado ${util.joinValues(
        issue.options
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Enum no formato inválido. Foi esperado ${util.joinValues(
        issue.options
      )}, porém foi recebido '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Argumento de função inválido`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Tipo de retorno de função inválido`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Data inválida`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Entrada inválida: deve incluir "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} em uma ou mais posições maiores ou iguais a ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Entrada inválida: deve iniciar com "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Entrada inválida: deve terminar com "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `${issue.validation} inválido`;
      } else {
        message = "Combinação inválida";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Lista deve conter ${
          issue.exact ? "exatamente" : issue.inclusive ? `no mínimo` : `mais de`
        } ${issue.minimum} elemento(s)`;
      else if (issue.type === "string")
        message = `Texto deve conter ${
          issue.exact
            ? "exatamente"
            : issue.inclusive
              ? `pelo menos`
              : `mais de`
        } ${issue.minimum} caracter(es)`;
      else if (issue.type === "number")
        message = `Número deve ser ${
          issue.exact
            ? `exatamente igual a`
            : issue.inclusive
              ? `maior ou igual a`
              : `maior que`
        } ${issue.minimum}`;
      else if (issue.type === "date")
        message = `Data deve ser ${
          issue.exact
            ? `exatamente`
            : issue.inclusive
              ? `maior ou igual a`
              : `maior que`
        } ${new Date(Number(issue.minimum))}`;
      else message = "Entrada inválida";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Lista deve conter ${
          issue.exact
            ? `exatamente`
            : issue.inclusive
              ? `no máximo`
              : `menos de`
        } ${issue.maximum} elemento(s)`;
      else if (issue.type === "string")
        message = `Texto deve conter ${
          issue.exact
            ? `exatamente`
            : issue.inclusive
              ? `no máximo`
              : `menos que`
        } ${issue.maximum} caracter(es)`;
      else if (issue.type === "number")
        message = `Número deve ser ${
          issue.exact
            ? `exatamente igual a`
            : issue.inclusive
              ? `menor ou igual a`
              : `menor que`
        } ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt deve ser ${
          issue.exact
            ? `exatamente igual a`
            : issue.inclusive
              ? `menor ou igual a`
              : `menor que`
        } ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Data deve ser ${
          issue.exact
            ? `exatamente`
            : issue.inclusive
              ? `menor ou igual a`
              : `menor que`
        } ${new Date(Number(issue.maximum))}`;
      else message = "Entrada inválida";
      break;
    case ZodIssueCode.custom:
      message = `Entrada inválida`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Valores de interseção não puderam ser mesclados`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `O número deverá ser múltiplo de ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Número não pode ser infinito";
      break;
    case ZodIssueCode.not_unique:
      message = issue.duplicates?.length
        ? `Elemento(s): '${issue.duplicates}' não são únicos`
        : "Os valores devem ser únicos";
      break;
    case ZodIssueCode.invalid_file_type:
      message = `Tipo de arquivo inválido. Era esperado ${util.joinValues(
        issue.expected
      )}, porém foi recebido '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_file_name:
      message = `Nome de arquivo inválido`;
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export default errorMap;
