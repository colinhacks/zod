import { type ZodErrorMap, ZodIssueCode } from "../ZodError.js";
import { util } from "../helpers/index.js";

const errorMap: ZodErrorMap = (issue, _ctx) => {
  let message: string;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === util.ZodParsedType.undefined) {
        message = "Obligatoire";
      } else {
        message = `Le type « ${issue.expected} » est attendu mais « ${issue.received} » a été reçu`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `La valeur doit être ${JSON.stringify(
        issue.expected,
        util.jsonStringifyReplacer
      )}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Une ou plusieurs clé(s) non reconnue(s) dans l'objet : ${util.joinValues(
        issue.keys,
        ", "
      )}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Champ non valide`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `La valeur du discriminateur est non valide. Options attendues : ${util.joinValues(
        issue.options
      )}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `La valeur « ${
        issue.received
      } » n'existe pas dans les options : ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Les arguments de la fonction sont non valides`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Le type de retour de la fonction n'est pas valide`;
      break;
    case ZodIssueCode.invalid_date:
      message = `La date est non valide`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Champ non valide : doit inclure « ${issue.validation.includes} »`;
          if (typeof issue.validation.position === "number") {
            message = `${message} à une ou plusieurs positions supérieures ou égales à ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Le champ doit commencer par « ${issue.validation.startsWith} »`;
        } else if ("endsWith" in issue.validation) {
          message = `Le champ doit se terminer par « ${issue.validation.endsWith} »`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `${issue.validation} non valide`;
      } else {
        message = "Champ non valide";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `La liste doit contenir ${
          issue.exact ? "exactement" : issue.inclusive ? `au moins` : `plus de`
        } ${issue.minimum} élément(s)`;
      else if (issue.type === "string")
        message = `Le texte doit contenir ${
          issue.exact ? "exactement" : issue.inclusive ? `au moins` : `plus de`
        } ${issue.minimum} caractère(s)`;
      else if (issue.type === "number")
        message = `Le nombre doit être ${
          issue.exact
            ? `égal à `
            : issue.inclusive
              ? `supérieur ou égal à `
              : `supérieur à `
        }${issue.minimum}`;
      else if (issue.type === "date")
        message = `La date doit être ${
          issue.exact
            ? `égale au `
            : issue.inclusive
              ? `ultérieure ou égale au `
              : `ultérieure au `
        }${new Date(Number(issue.minimum))}`;
      else message = "Champ non valide";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `La liste doit contenir ${
          issue.exact ? `exactement` : issue.inclusive ? `au plus` : `moins de`
        } ${issue.maximum} élément(s)`;
      else if (issue.type === "string")
        message = `Le texte doit contenir ${
          issue.exact ? `exactement` : issue.inclusive ? `au plus` : `moins de`
        } ${issue.maximum} caractère(s)`;
      else if (issue.type === "number")
        message = `Le nombre doit être ${
          issue.exact
            ? `égal à`
            : issue.inclusive
              ? `inférieur ou égal à`
              : `inférieur à`
        } ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `Le grand entier doit être ${
          issue.exact
            ? `exactement`
            : issue.inclusive
              ? `inférieur ou égal à`
              : `inférieur à`
        } ${issue.maximum}`;
      else if (issue.type === "date")
        message = `La date doit être ${
          issue.exact
            ? `égale au`
            : issue.inclusive
              ? `antérieure ou égale au`
              : `antérieure au`
        } ${new Date(Number(issue.maximum))}`;
      else message = "Champ non valide";
      break;
    case ZodIssueCode.custom:
      message = `Champ non valide`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Les résultats d'intersection n'ont pas pu être fusionnés`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Le nombre doit être un multiple de ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Le nombre doit être fini";
      break;
    case ZodIssueCode.uniqueness:
      message = issue.duplicateElements?.length
        ? `Élément(s) : '${issue.duplicateElements}' non unique(s)`
        : "Les valeurs doivent être uniques";
      break;
    case ZodIssueCode.invalid_file_type:
      message = `Type de fichier non valide. ${util.joinValues(
        issue.expected
      )} attendu, '${issue.received}' reçu`;
      break;
    case ZodIssueCode.invalid_file_name:
      message = `Nom de fichier non valide`;
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};

export default errorMap;
