import type * as zsf from "./zsf.js";

type ZodParsedType = string;
type Primitive = string | number | boolean | bigint | symbol | undefined | null;
class ZodError {}
type flatten<T> = { [k in keyof T]: T[k] } & {};

type ZodCheckCode = zsf.$ZSFCheck["check"];

export type $ZodIssueBase = {
  level: "error" | "abort";
  path: (string | number)[];
  message: string;
  input?: unknown;
};

export type $ZodIssueInvalidType = $ZodIssueBase & {
  check: "type";
} & (
    | {
        expected: ZodParsedType;
        received: ZodParsedType;
      }
    | {
        expected: "union";
        unionErrors: ZodError[];
      }
    | {
        expected: "literal";
        literalValues: Primitive[];
      }
    | {
        expected: "enum";
        enumValues: (string | number)[];
      }
  );

export interface $ZodIssueRegex extends $ZodIssueBase, zsf.$ZSFCheckRegex {
  input?: string;
}

export interface $ZodIssueEmail extends $ZodIssueBase, zsf.$ZSFCheckEmail {
  input?: string;
}

export interface $ZodIssueURL extends $ZodIssueBase, zsf.$ZSFCheckURL {
  input?: string;
}

export interface $ZodIssueEmoji extends $ZodIssueBase, zsf.$ZSFCheckEmoji {
  input?: string;
}

export interface $ZodIssueUUID extends $ZodIssueBase, zsf.$ZSFCheckUUID {
  input?: string;
}

export interface $ZodIssueUUIDv4 extends $ZodIssueBase, zsf.$ZSFCheckUUIDv4 {
  input?: string;
}

export interface $ZodIssueUUIDv6 extends $ZodIssueBase, zsf.$ZSFCheckUUIDv6 {
  input?: string;
}

export interface $ZodIssueNanoid extends $ZodIssueBase, zsf.$ZSFCheckNanoid {
  input?: string;
}

export interface $ZodIssueGUID extends $ZodIssueBase, zsf.$ZSFCheckGUID {
  input?: string;
}

export interface $ZodIssueCUID extends $ZodIssueBase, zsf.$ZSFCheckCUID {
  input?: string;
}

export interface $ZodIssueCUID2 extends $ZodIssueBase, zsf.$ZSFCheckCUID2 {
  input?: string;
}

export interface $ZodIssueULID extends $ZodIssueBase, zsf.$ZSFCheckULID {
  input?: string;
}

export interface $ZodIssueXID extends $ZodIssueBase, zsf.$ZSFCheckXID {
  input?: string;
}

export interface $ZodIssueKSUID extends $ZodIssueBase, zsf.$ZSFCheckKSUID {
  input?: string;
}

export interface $ZodIssueISODateTime
  extends $ZodIssueBase,
    zsf.$ZSFCheckISODateTime {
  input?: string;
}

export interface $ZodIssueISODate extends $ZodIssueBase, zsf.$ZSFCheckISODate {
  input?: string;
}

export interface $ZodIssueISOTime extends $ZodIssueBase, zsf.$ZSFCheckISOTime {
  input?: string;
}

export interface $ZodIssueDuration
  extends $ZodIssueBase,
    zsf.$ZSFCheckDuration {
  input?: string;
}

export interface $ZodIssueIP extends $ZodIssueBase, zsf.$ZSFCheckIP {
  input?: string;
}

export interface $ZodIssueIPv4 extends $ZodIssueBase, zsf.$ZSFCheckIPv4 {
  input?: string;
}

export interface $ZodIssueIPv6 extends $ZodIssueBase, zsf.$ZSFCheckIPv6 {
  input?: string;
}

export interface $$ZodIssueBase64 extends $ZodIssueBase, zsf.$ZSFCheckBase64 {
  input?: string;
}

export interface $ZodIssueJWT extends $ZodIssueBase, zsf.$ZSFCheckJWT {
  input?: string;
}

export interface $ZodIssueJSONString
  extends $ZodIssueBase,
    zsf.$ZSFCheckJSONString {
  input?: string;
}

export interface $ZodIssuePrefix extends $ZodIssueBase, zsf.$ZSFCheckPrefix {
  input?: string;
}

export interface $ZodIssueSuffix extends $ZodIssueBase, zsf.$ZSFCheckSuffix {
  input?: string;
}

export interface $ZodIssueIncludes
  extends $ZodIssueBase,
    zsf.$ZSFCheckIncludes {
  input?: string;
}

export type $ZodStringFormats = zsf.$ZSFStringFormatChecks["check"];

export interface $ZodIssueMinSize extends $ZodIssueBase, zsf.$ZSFCheckMinSize {
  input?: string | Array<unknown> | Set<unknown> | File;
}

export interface $ZodIssueMaxSize extends $ZodIssueBase, zsf.$ZSFCheckMaxSize {
  input?: string | Array<unknown> | Set<unknown> | File;
}

export interface $ZodIssueSizeEquals
  extends $ZodIssueBase,
    zsf.$ZSFCheckSizeEquals {
  input?: string | Array<unknown> | Set<unknown> | File;
}

export interface $ZodIssueLessThan
  extends $ZodIssueBase,
    zsf.$ZSFCheckLessThan {
  input?: number | bigint | Date;
}

export interface $ZodIssueLessThanOrEqual
  extends $ZodIssueBase,
    zsf.$ZSFCheckLessThanOrEqual {
  input?: number | bigint | Date;
}

export interface $ZodIssueGreaterThan
  extends $ZodIssueBase,
    zsf.$ZSFCheckGreaterThan {
  input?: number | bigint | Date;
}

export interface $ZodIssueGreaterThanOrEqual
  extends $ZodIssueBase,
    zsf.$ZSFCheckGreaterThanOrEqual {
  input?: number | bigint | Date;
}

export interface $ZodIssueEquals extends $ZodIssueBase, zsf.$ZSFCheckEquals {
  input?: number | bigint | Date;
}

export interface $ZodIssueMultipleOf
  extends $ZodIssueBase,
    zsf.$ZSFCheckMultipleOf {
  input?: number | bigint;
}

// // export type ZodStringFormatIssue = $ZodIssueBase & {
// //   check: "string_format";
// //   input?: string;
// // } & (
// //     | { format: "regex"; pattern: string }
// //     | { format: "email" }
// //     | { format: "url" }
// //     | { format: "emoji" }
// //     | { format: "uuid" }
// //     | { format: "uuidv4" }
// //     | { format: "uuidv6" }
// //     | { format: "nanoid" }
// //     | { format: "guid" }
// //     | { format: "cuid" }
// //     | { format: "cuid2" }
// //     | { format: "ulid" }
// //     | { format: "xid" }
// //     | { format: "ksuid" }
// //     | { format: "iso_datetime" }
// //     | { format: "iso_date" }
// //     | { format: "iso_time" }
// //     | { format: "duration" }
// //     | { format: "ip" }
// //     | { format: "ipv4" }
// //     | { format: "ipv6" }
// //     | { format: "base64" }
// //     | { format: "jwt" }
// //     | { format: "json_string" }
// //     | { format: "prefix"; prefix: string }
// //     | { format: "suffix"; suffix: string }
// //     | { format: "includes"; includes: string }
// //     | { format: string & {} }
// //   );
// // export type $StringFormat = ZodStringFormatIssue["format"];

// // declare const x: "a:stuff" | "b:things";
// // if (x.startsWith("a:")) {
// //   x;
// // }
// // export type ZodRegexIssue = $ZodIssueBase & {
// //   check: "regex";
// //   input?: string;
// //   regex: string;
// // };

// // export type ZodStartsWithIssue = $ZodIssueBase & {
// //   check: "starts_with";
// //   value: string;
// //   input?: string;
// // };

// // export type ZodEndsWithIssue = $ZodIssueBase & {
// //   check: "ends_with";
// //   value: string;
// //   input?: string;
// // };

// // export type ZodIncludesIssue = $ZodIssueBase & {
// //   check: "includes";
// //   value: string;
// //   input?: string;
// // };

// export type ZodMinSizeIssue = $ZodIssueBase & {
//   check: "min_size";
//   domain: "string" | "array" | "set" | "file";
//   minimum: number;
//   input?: string | Array<unknown> | Set<unknown> | File;
// };

// export type ZodMaxSizeIssue = $ZodIssueBase & {
//   check: "max_size";
//   domain: "string" | "array" | "set" | "file";
//   maximum: number;
//   input?: string | Array<unknown> | Set<unknown> | File;
// };

// export type ZodSizeIssue = $ZodIssueBase & {
//   check: "size_equals";
//   domain: "string" | "array" | "set" | "file";
//   size: number;
//   input?: string | Array<unknown> | Set<unknown> | File;
// };

// export type ZodLessThanIssue = $ZodIssueBase & {
//   check: "less_than";
//   maximum: number | bigint | Date;
//   domain: "number" | "bigint" | "date";
//   input?: number | bigint | Date;
// };

// export type ZodLessThanOrEqualIssue = $ZodIssueBase & {
//   check: "less_than_or_equal";
//   maximum: number | bigint | Date;
//   domain: "number" | "bigint" | "date";
//   input?: number | bigint | Date;
// };

// export type ZodGreaterThanIssue = flatten<
//   $ZodIssueBase & {
//     check: "greater_than";
//     minimum: number | bigint | Date;
//     domain: "number" | "bigint" | "date";
//     input?: number | bigint | Date;
//   }
// >;

// export type ZodGreaterThanOrEqualIssue = $ZodIssueBase & {
//   check: "greater_than_or_equal";
//   minimum: number | bigint | Date;
//   domain: "number" | "bigint" | "date";
//   input?: number | bigint | Date;
// };

// export type ZodEqualsIssue = $ZodIssueBase & {
//   check: "equals";
//   value: number | bigint | Date;
//   domain: "number" | "bigint" | "date";
//   input?: number | bigint | Date;
// };

// export type ZodMultipleOfIssue = $ZodIssueBase & {
//   check: "multiple_of";
//   multipleOf: number;
//   input?: number;
// };

export interface $ZodIssueUnrecognizedKeys extends $ZodIssueBase {
  check: "unrecognized_keys";
  keys: string[];
  input?: object;
}

// user-defined custom issue sub-types
export interface $ZodCustomCustom {
  custom: { params?: { [k: string]: any } };
}

type _ZodCustomIssue = flatten<
  $ZodIssueBase & { check: "custom" } & $ZodCustomCustom[keyof $ZodCustomCustom]
>;
export type $ZodIssueCustom = _ZodCustomIssue;

export type ZodIssue = flatten<
  | $ZodIssueInvalidType
  | $ZodIssueBase // | $ZodStringFormatIssue
  | $ZodIssueRegex
  | $ZodIssuePrefix
  | $ZodIssueSuffix
  | $ZodIssueIncludes
  | $ZodIssueMinSize
  | $ZodIssueMaxSize
  | $ZodIssueSizeEquals
  | $ZodIssueLessThan
  | $ZodIssueLessThanOrEqual
  | $ZodIssueGreaterThan
  | $ZodIssueGreaterThanOrEqual
  | $ZodIssueEquals
  | $ZodIssueMultipleOf
  | $ZodIssueUnrecognizedKeys
  | $ZodIssueCustom
>;

// make input required (message is omitted)
export type $ZodIssueData<T extends $ZodIssueBase = ZodIssue> = T extends any
  ? flatten<
      Omit<Required<T>, "message" | "path" | "level"> & {
        // input?: any;
        path?: (string | number)[];
        // fatal?: boolean;
        level?: "warn" | "error" | "abort";
        message?: string | undefined;
      }
    >
  : never;
// type aaa = $ZodIssueData;

/** @deprecated Use `$ZodIssueData` instead. */
export type IssueData = $ZodIssueData;

/** @deprecated */
export type $ZodErrorMapCtx = {
  /** @deprecated To use the default error, return `undefined` or don't return anything at all. */
  defaultError: string;
  /** @deprecated The input data is now available via the `input` property on the issue data (first parameter.)
   *
   * ```ts
   * const errorMap: ZodErrorMap = (issue) => {
   *   // issue.input ;
   * }
   * ```
   */
  data: any;
};
/** @deprecated Use $ZodErrorMapCtx instead. */
export type ErrorMapCtx = $ZodErrorMapCtx;

export type $ZodErrorMap<T extends $ZodIssueBase = ZodIssue> = (
  issue: $ZodIssueData<T>,
  /** @deprecated */
  _ctx?: ErrorMapCtx
) => { message: string } | string | undefined;
