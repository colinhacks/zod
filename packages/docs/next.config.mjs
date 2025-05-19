import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/**
 *
 * @param {object} idmap
 * @param {string} page
 * * @param {string?} origin
 */
function generateRedirects(idmap, page, origin = null) {
  /** @type import("next").Redirect */
  const redirects = [];

  for (const [key, value] of Object.entries(idmap)) {
    if (key === value && origin === null)
      redirects.push({
        source: origin ?? `/`,
        has: [
          {
            type: "query",
            key: "id",
            value: key,
          },
        ],
        destination: `/${page}?id=${value}#{value}`,
        permanent: true,
      });
  }
  return redirects;
}
/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  redirects() {
    const mainPageRedirects = [
      // INTRO
      ...generateRedirects(
        {
          introduction: "introduction",
          sponsors: "sponsors",
          platinum: "platinum",
          gold: "gold",
          silver: "silver",
          bronze: "bronze",
          copper: "bronze",
          installation: "installation",
          requirements: "requirements",
          "from-npm": "installation",
        },
        "/intro"
      ),

      // ECOSYSTEM
      ...generateRedirects(
        {
          ecosystem: "ecosystem",
          resources: "resources",
          "api-libraries": "api-libraries",
          "form-integrations": "form-integrations",
          "zod-to-x": "zod-to-x",
          "x-to-zod": "x-to-zod",
          mocking: "mocking-libaries",
          "powered-by-zod": "powered-by-zod",
          "utilities-for-zod": "zod-utilities",
        },
        "/ecosystem"
      ),

      // BASIC USAGE
      ...generateRedirects(
        {
          "basic-usage": "defining-a-schema",
          "type-inference": "inferred-types",
          "schema-methods": "schema-methods",
          parse: "parse",
          parseasync: "parse",
          safeparse: "safeparse",
          safeparseasync: "safeparse",
        },
        "/basic-usage"
      ),

      // API
      ...generateRedirects(
        {
          primitives: "primitives",
          "coercion-for-primitives": "coercion",
          literals: "literals",
          strings: "strings",
          datetimes: "iso-datetimes",
          dates: "iso-dates",
          times: "iso-times",
          "ip-addresses": "ip-addresses",
          "ip-ranges-cidr": "ip-blocks-cidr",
          numbers: "numbers",
          bigints: "bigints",
          nans: "numbers",
          booleans: "booleans",
          "dates-1": "dates",
          "zod-enums": "enums",
          "native-enums": "native-enums",
          optionals: "optionals",
          nullables: "nullables",
          optional: "optionals",
          nullable: "nullables",
          nullish: "nullish",
          objects: "objects",
          shape: "shape",
          keyof: "keyof",
          extend: "extend",
          merge: "merge",
          pickomit: "pick",
          partial: "partial",
          deeppartial: "partial",
          required: "required",
          passthrough: "zlooseobject",
          strict: "zstrictobject",
          strip: "strip",
          catchall: "catchall",
          arrays: "arrays",
          element: "arrays",
          nonempty: "arrays",
          minmaxlength: "arrays",
          tuples: "tuples",
          unions: "unions",
          "discriminated-unions": "discriminated-unions",
          records: "records",
          maps: "maps",
          sets: "sets",
          intersections: "intersections",
          "recursive-types": "recursive-objects",
          "zodtype-with-zodeffects": "recursive-objects",
          "json-type": "json",
          "cyclical-objects": "recursive-objects",
          promises: "promises",
          instanceof: "instanceof",
          functions: "functions",
          preprocess: "preprocess",
          "custom-schemas": "custom",

          // methods
          refine: "refinements",
          arguments: "refine",
          "customize-error-path": "refine",
          "asynchronous-refinements": "refine",
          "relationship-to-transforms": "refine",
          superrefine: "superrefine",
          "abort-early": "transforms",
          "type-refinements": "refine",
          transform: "transforms",
          "chaining-order": "transforms",
          "validating-during-transform": "transforms",
          "relationship-to-refinements": "transforms",
          "async-transforms": "transforms",
          default: "defaults",
          catch: "catch",
          array: "array",
          promise: "promise",
          or: "unions",
          and: "intersections",
          brand: "branded-types",
          readonly: "readonly",
          pipe: "pipes",
        },
        "/api"
      ),

      // METADATA
      ...generateRedirects(
        {
          describe: "describe",
        },
        "/metadata"
      ),

      // FOR MAINTAINERS
      ...generateRedirects(
        {
          // "writing-generic-functions": "how-to-accept-user-define-schemas",
          // "inferring-the-inferred-type": "how-to-accept-user-define-schemas",
          // "constraining-allowable-inputs": "how-to-accept-user-define-schemas",
        },
        "/library-authors"
      ),

      // FORMATTING ERRORS
      // error-formatting
      ...generateRedirects(
        {
          "error-formatting": "",
        },
        "/error-formatting"
      ),

      ...generateRedirects(
        {
          "error-handling": "handling-errors",
        },
        "/basic-usage"
      ),

      // DROPPED
      // guides-and-concepts
      // changelog
      // comparison
      // joi
      // yup
      // io-ts
      // runtypes
      // ow
    ];

    const errorHandlingRedirects = [
      // CUSTOMIZING ERRORS
      ...generateRedirects(
        {
          "error-handling": "",
          "error-map-priority": "error-precedence",
          "global-error-map": "error-precedence",
          "schema-bound-error-map": "error-precedence",
          "contextual-error-map": "error-precedence",
          "customizing-errors-with-zoderrormap": "global-error-customization",
          "a-demonstrative-example": "",
        },
        "/error-customization",
        "/ERROR_HANDLING"
      ),
      ...generateRedirects(
        {
          "error-formatting": "",
          "error-handling-for-forms": "error-handling-for-forms",
          "formatting-errors": "formatting-errors",
          "flattening-errors": "zflattenerror",
          "post-processing-issues": "post-processing-issues",
          "extract-type-signature": "extract-type-signature",
          "a-working-example": "global-error-customization",
        },
        "/error-formatting",
        "/ERROR_HANDLING"
      ),
      // /ERROR_HANDLING.md
      ...generateRedirects(
        {
          zoderror: "zoderror",
          zodissue: "zodissue",
          zodissuecode: "zodissuecode",
          zodparsedtype: "zodparsedtype",

          "post-processing-issues": "ztreeifyerror",
          "extract-type-signature": "ztreeifyerror",
        },
        "/error-handling",
        "/ERROR_HANDLING" // origin
      ),
    ];

    const changelogRedirects = [
      // /CHANGELOG redirect to https://github.com/colinhacks/zod/releases
      {
        source: "/CHANGELOG",
        destination: "https://github.com/colinhacks/zod/releases",
        permanent: false,
      },
    ];

    return [...mainPageRedirects, ...errorHandlingRedirects, ...changelogRedirects];
  },
};

export default withMDX(config);
