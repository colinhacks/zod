import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/**
 *
 * @param {object} idmap
 * @param {string} page
 */
function generateRedirects(idmap, page) {
  /** @type import("next").Redirect */
  const redirects = [];
  // return redirects;
  // for (const [key, value] of Object.entries(idmap)) {
  //   redirects.push({
  //     source: `/`,
  //     has: [
  //       {
  //         type: "query",
  //         key: "id",
  //         value: key,
  //       },
  //     ],
  //     destination: `/${page}#${value}`,
  //   });
  // }
  return redirects;
}
/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  redirects() {
    return [
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
          // basic-usage
          // type-inference
        },
        "/basic-usage"
      ),

      // API
      ...generateRedirects(
        {
          // primitives: "primitives",
          // "coercion-for-primitives": "coercion-for-primitives",
          // literals: "literals",
          // strings: "strings",
          // datetimes: "datetimes",
          // dates: "dates",
          // times: "times",
          // "ip-addresses": "ip-addresses",
          // "ip-ranges-cidr": "ip-ranges-cidr",
          // numbers: "numbers",
          // bigints: "bigints",
          // nans: "nans",
          // booleans: "booleans",
          // "dates-1": "dates-1",
          // "zod-enums": "zod-enums",
          // "native-enums": "native-enums",
          // optionals: "optionals",
          // nullables: "nullables",
          // objects: "objects",
          // shape: "shape",
          // keyof: "keyof",
          // extend: "extend",
          // merge: "merge",
          // pickomit: "pickomit",
          // partial: "partial",
          // deeppartial: "deeppartial",
          // required: "required",
          // passthrough: "passthrough",
          // strict: "strict",
          // strip: "strip",
          // catchall: "catchall",
          // arrays: "arrays",
          // element: "element",
          //  nonempty: "nonempty",
          //  minmaxlength: "minmaxlength",
          //  tuples: "tuples",
          //  unions: "unions",
          //  "discriminated-unions": "discriminated-unions",
          //  records: "records",
          //  "record-key-type": "record-key-type",
          //  maps: "maps",
          //  sets: "sets",
          //  intersections: "intersections",
          //  "recursive-types": "recursive-types",
          //  "zodtype-with-zodeffects": "zodtype-with-zodeffects",
          //  "json-type": "json-type",
          //  "cyclical-objects": "cyclical-objects",
          //  promises: "promises",
          //  instanceof: "instanceof",
          //  functions: "functions",
          //  preprocess: "preprocess",
          //  "custom-schemas": "custom-schemas",
          //  "schema-methods": "schema-methods",
          //  parse: "parse",
          //  parseasync: "parseasync",
          //  safeparse: "safeparse",
          //  safeparseasync: "safeparseasync",
          //  refine: "refine",
          //  arguments: "arguments",
          //  "customize-error-path": "customize-error-path",
          //  "asynchronous-refinements": "asynchronous-refinements",
          //  "relationship-to-transforms": "relationship-to-transforms",
          //  superrefine: "superrefine",
          //  "abort-early": "abort-early",
          //  "type-refinements": "type-refinements",
          //  transform: "transform",
          //  "chaining-order": "chaining-order",
          //  "validating-during-transform": "validating-during-transform",
          //  "relationship-to-refinements": "relationship-to-refinements",
          //  "async-transforms": "async-transforms",
          //  default: "default",
          //  describe: "describe",
          //  catch: "catch",
          //  optional: "optional",
          //  nullable: "nullable",
          //  nullish: "nullish",
          //  array: "array",
          //  promise: "promise",
          //  or: "or",
          //  and: "and",
          //  brand: "brand",
          //  readonly: "readonly",
          //  pipe: "pipe",
        },
        "/api"
      ),

      // FOR MAINTAINERS
      ...generateRedirects(
        {
          // writing-generic-functions
          // inferring-the-inferred-type
          // constraining-allowable-inputs
        },
        "/library-authors"
      ),

      // CUSTOMIZING ERRORS
      ...generateRedirects(
        {
          // error-handling
        },
        "/customizing-errors"
      ),

      // FORMATTING ERRORS
      // error-formatting
      ...generateRedirects(
        {
          // error-formatting
        },
        "/formatting-errors"
      ),

      // /ERROR_HANDLING.md

      ...generateRedirects(
        {
          // zoderror
          // zodissue
          // zodissuecode
          // zodparsedtype
          // a-demonstrative-example
          // customizing-errors-with-zoderrormap
          // error-map-priority
          // global-error-map
          // schema-bound-error-map
          // contextual-error-map
          // a-working-example
          // error-handling-for-forms
          // formatting-errors
          // flattening-errors
          // post-processing-issues
          // extract-type-signature
        },
        "/error-handling"
      ),

      // /CHANGELOG
      // https://github.com/colinhacks/zod/releases

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
  },
};

export default withMDX(config);
