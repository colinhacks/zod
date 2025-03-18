// import type * as core from "@zod/core";
// import type * as util from "./util.js";

// ///////////////////////////
// ////     base type     ////
// ///////////////////////////
// export interface $ZodIssueBase {
//   code?: string;
//   input?: unknown;
//   path: PropertyKey[];
//   message: string;
//   // [k: string]: unknown;
// }

// ////////////////////////////////
// ////     issue subtypes     ////
// ////////////////////////////////
// export interface $ZodIssueInvalidType<Input = unknown> extends $ZodIssueBase {
//   code: "invalid_type";
//   expected: core.ZodSchemaTypes;
//   input: Input;
// }

// export interface $ZodIssueTooBig<Input = unknown> extends $ZodIssueBase {
//   code: "too_big";
//   origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
//   maximum: number | bigint;
//   inclusive?: boolean;
//   input: Input;
// }

// export interface $ZodIssueTooSmall<Input = unknown> extends $ZodIssueBase {
//   code: "too_small";
//   origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
//   minimum: number | bigint;
//   inclusive?: boolean;
//   input: Input;
// }

// export interface $ZodIssueInvalidStringFormat extends $ZodIssueBase {
//   code: "invalid_format";
//   format: string;
//   pattern?: string;
//   input: string;
// }

// export interface $ZodIssueNotMultipleOf<Input extends number | bigint = number | bigint> extends $ZodIssueBase {
//   code: "not_multiple_of";
//   divisor: number;
//   input: Input;
// }

// // export interface $ZodIssueInvalidDate extends $ZodIssueBase {
// //   code: "invalid_date";
// //   input: Date;
// // }

// export interface $ZodIssueUnrecognizedKeys extends $ZodIssueBase {
//   code: "unrecognized_keys";
//   keys: string[];
//   input: Record<string, unknown>;
// }

// export interface $ZodIssueInvalidUnion extends $ZodIssueBase {
//   code: "invalid_union";
//   errors: $ZodIssue[][];
//   input: unknown;
// }

// export interface $ZodIssueInvalidKey<Input = unknown> extends $ZodIssueBase {
//   code: "invalid_key";
//   origin: "map" | "record";
//   issues: $ZodIssue[];
//   input: Input;
// }

// export interface $ZodIssueInvalidElement<Input = unknown> extends $ZodIssueBase {
//   code: "invalid_element";
//   origin: "map" | "set";
//   key: unknown;
//   issues: $ZodIssue[];
//   input: Input;
// }

// export interface $ZodIssueInvalidValue<Input = unknown> extends $ZodIssueBase {
//   code: "invalid_value";
//   values: util.Primitive[];
//   input: Input;
// }

// export interface $ZodIssueCustom extends $ZodIssueBase {
//   code?: "custom";
//   params?: Record<string, any> | undefined;
//   input: unknown;
// }

// ////////////////////////////////////////////
// ////     first-party string formats     ////
// ////////////////////////////////////////////

// type CommonStringFormats =
//   | "regex"
//   | "email"
//   | "url"
//   | "emoji"
//   | "uuid"
//   | "guid"
//   | "nanoid"
//   | "guid"
//   | "cuid"
//   | "cuid2"
//   | "ulid"
//   | "xid"
//   | "ksuid"
//   | "iso_datetime"
//   | "iso_date"
//   | "iso_time"
//   | "duration"
//   | "ip"
//   | "ipv4"
//   | "ipv6"
//   | "base64"
//   | "json_string"
//   | "e164"
//   | "lowercase"
//   | "uppercase";

// export interface $ZodIssueStringCommonFormats extends $ZodIssueInvalidStringFormat {
//   format: CommonStringFormats;
// }

// export interface $ZodIssueStringInvalidRegex extends $ZodIssueInvalidStringFormat {
//   format: "regex";
//   pattern: string;
// }

// export interface $ZodIssueStringInvalidJWT extends $ZodIssueInvalidStringFormat {
//   format: "jwt";
//   algorithm?: string;
// }

// export interface $ZodIssueStringStartsWith extends $ZodIssueInvalidStringFormat {
//   format: "starts_with";
//   prefix: string;
// }

// export interface $ZodIssueStringEndsWith extends $ZodIssueInvalidStringFormat {
//   format: "ends_with";
//   suffix: string;
// }

// export interface $ZodIssueStringIncludes extends $ZodIssueInvalidStringFormat {
//   format: "includes";
//   includes: string;
// }

// export type $ZodStringFormatIssues =
//   | $ZodIssueStringCommonFormats
//   | $ZodIssueStringInvalidRegex
//   | $ZodIssueStringInvalidJWT
//   | $ZodIssueStringStartsWith
//   | $ZodIssueStringEndsWith
//   | $ZodIssueStringIncludes;

// export type $ZodStringFormats = $ZodStringFormatIssues["format"];

// ////////////////////////
// ////     utils     /////
// ////////////////////////

// export type $ZodIssue =
//   | $ZodIssueInvalidType
//   | $ZodIssueTooBig
//   | $ZodIssueTooSmall
//   | $ZodIssueInvalidStringFormat
//   | $ZodIssueNotMultipleOf
//   // | $ZodIssueInvalidDate
//   | $ZodIssueUnrecognizedKeys
//   | $ZodIssueInvalidUnion
//   | $ZodIssueInvalidKey
//   | $ZodIssueInvalidElement
//   | $ZodIssueInvalidValue
//   | $ZodIssueCustom;

// export type $ZodRawIssue<T extends $ZodIssueBase = $ZodIssue> = T extends any ? RawIssue<T> : never;
// // type DefLike = { error?: $ZodErrorMap<never> | undefined };
// type RawIssue<T extends $ZodIssueBase> = util.Flatten<
//   util.MakePartial<T, "message" | "path"> & {
//     // def?: DefLike | undefined;
//     def?: never;
//     inst?: core.$ZodType | core.$ZodCheck;
//     continue?: boolean | undefined;
//     input?: unknown;
//   } & Record<string, any>
// >;

// // export type $ZodErrorMapCtx = {
// //   /** @deprecated To use the default error, return `undefined` or don't return anything at all. */
// //   defaultError?: string;

// //   /**
// //    * @deprecated The input data is now available via the `input` property on the issue data (first parameter.)
// //    *
// //    * ```ts
// //    * const errorMap: $ZodErrorMap = (issue) => {
// //    *   // issue.input;
// //    * }
// //    * ```
// //    */
// //   data: any;
// // };

// // export interface $ZodErrorMap<T extends $ZodIssueBase = $ZodIssue> {
// //   // biome-ignore lint:
// //   (
// //     issue: $ZodRawIssue<T>,
// //     /** @deprecated */
// //     _ctx?: $ZodErrorMapCtx
// //   ): { message: string } | string | undefined;
// // }

// export interface $ZodErrorMap<T extends $ZodIssueBase = $ZodIssue> {
//   // biome-ignore lint:
//   (issue: $ZodRawIssue<T>): { message: string } | string | undefined | null;
// }
