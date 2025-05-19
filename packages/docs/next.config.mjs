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
      {
        source: "/",
        has: [
          {
            type: "query",
            key: "id",
            value: "primitives",
          },
        ],
        destination: "/api#primitives",
        permanent: true,
      },

      // INTRO
      ...generateRedirects(
        {
          // introduction
          // sponsors
          // platinum
          // gold
          // silver
          // bronze
          // copper
          // installation
          // requirements
          // from-npm
        },
        "/intro"
      ),

      // ECOSYSTEM
      ...generateRedirects(
        {
          // ecosystem
          // resources
          // api-libraries
          // form-integrations
          // zod-to-x
          // x-to-zod
          // mocking
          // powered-by-zod
          // utilities-for-zod
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
          // primitives
          // coercion-for-primitives
          // literals
          // strings
          // datetimes
          // dates
          // times
          // ip-addresses
          // ip-ranges-cidr
          // numbers
          // bigints
          // nans
          // booleans
          // dates-1
          // zod-enums
          // native-enums
          // optionals
          // nullables
          // objects
          // shape
          // keyof
          // extend
          // merge
          // pickomit
          // partial
          // deeppartial
          // required
          // passthrough
          // strict
          // strip
          // catchall
          // arrays
          // element
          // nonempty
          // minmaxlength
          // tuples
          // unions
          // discriminated-unions
          // records
          // record-key-type
          // maps
          // sets
          // intersections
          // recursive-types
          // zodtype-with-zodeffects
          // json-type
          // cyclical-objects
          // promises
          // instanceof
          // functions
          // preprocess
          // custom-schemas
          // schema-methods
          // parse
          // parseasync
          // safeparse
          // safeparseasync
          // refine
          // arguments
          // customize-error-path
          // asynchronous-refinements
          // relationship-to-transforms
          // superrefine
          // abort-early
          // type-refinements
          // transform
          // chaining-order
          // validating-during-transform
          // relationship-to-refinements
          // async-transforms
          // default
          // describe
          // catch
          // optional
          // nullable
          // nullish
          // array
          // promise
          // or
          // and
          // brand
          // readonly
          // pipe
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
