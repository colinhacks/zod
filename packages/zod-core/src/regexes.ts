export const cuidRegex: RegExp = /^[cC][^\s-]{8,}$/;
export const cuid2Regex: RegExp = /^[0-9a-z]+$/;
export const ulidRegex: RegExp = /^[0-9A-HJKMNP-TV-Z]{26}$/;
export const xidRegex: RegExp = /^[0-9a-vA-V]{20}$/;
export const ksuidRegex: RegExp = /^[A-Za-z0-9]{27}$/;
export const nanoidRegex: RegExp = /^[a-zA-Z0-9_-]{21}$/;
export const durationRegex: RegExp =
  /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;

/** A regex for any UUID-like identifier. */
export const guidRegex: RegExp = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

/** Returns a regex for validating an RFC 4122 UUID.
 *
 * @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
export const uuidRegex = (version?: number | undefined): RegExp => {
  if (!version)
    // return /^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/;
  // return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`, "i");
  return new RegExp(
    `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`
  );
};
export const uuid4Regex: RegExp = uuidRegex(4);
export const uuid6Regex: RegExp = uuidRegex(6);
export const uuid7Regex: RegExp = uuidRegex(7);

export const emailRegex: RegExp =
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
export const rfc5322 =
  /^((?:[A-Za-z0-9!#$%&'*+\-\/=?^_`{|}~]|(?<=^|\.)"|"(?=$|\.|@)|(?<=".*)[ .](?=.*")|(?<!\.)\.){1,64})(@)((?:[A-Za-z0-9.\-])*(?:[A-Za-z0-9])\.(?:[A-Za-z0-9]){2,})$/;
export const rfc6531 =
  /^(?<localPart>(?<dotString>[0-9a-z!#$%&'*+\-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+(\.[0-9a-z!#$%&'*+\-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+)*)|(?<quotedString>"([\x20-\x21\x23-\x5B\x5D-\x7E\u{80}-\u{10FFFF}]|\\[\x20-\x7E])*"))(?<!.{64,})@(?<domainOrAddressLiteral>(?<addressLiteral>\[((?<IPv4>\d{1,3}(\.\d{1,3}){3})|(?<IPv6Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){7})|(?<IPv6Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?)|(?<IPv6v4Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){5}:\d{1,3}(\.\d{1,3}){3})|(?<IPv6v4Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3}:)?\d{1,3}(\.\d{1,3}){3})|(?<generalAddressLiteral>[a-z0-9\-]*[[a-z0-9]:[\x21-\x5A\x5E-\x7E]+))\])|(?<Domain>(?!.{256,})(([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z\-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))(\.([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z\-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))*))$/iu;

// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
export const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
export function emojiRegex(): RegExp {
  return new RegExp(_emojiRegex, "u");
}

export const ipv4Regex: RegExp =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
export const ipv6Regex: RegExp =
  /^(([a-fA-F0-9]{1,4}:){7}|::([a-fA-F0-9]{1,4}:){0,6}|([a-fA-F0-9]{1,4}:){1}:([a-fA-F0-9]{1,4}:){0,5}|([a-fA-F0-9]{1,4}:){2}:([a-fA-F0-9]{1,4}:){0,4}|([a-fA-F0-9]{1,4}:){3}:([a-fA-F0-9]{1,4}:){0,3}|([a-fA-F0-9]{1,4}:){4}:([a-fA-F0-9]{1,4}:){0,2}|([a-fA-F0-9]{1,4}:){5}:([a-fA-F0-9]{1,4}:){0,1})([a-fA-F0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
export const ipRegex: RegExp = new RegExp(`(${ipv4Regex.source})|(${ipv6Regex.source})`);

// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
export const base64Regex: RegExp = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

// based on https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
export const hostnameRegex: RegExp =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

// https://blog.stevenlevithan.com/archives/validate-phone-number#r4-3 (regex sans spaces)
export const e164Regex: RegExp = /^\+(?:[0-9]){6,14}[0-9]$/;

const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
export const dateRegex: RegExp = new RegExp(`^${dateRegexSource}$`);

function timeRegexSource(args: { precision?: number | null }) {
  // let regex = `\\d{2}:\\d{2}:\\d{2}`;
  let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;

  if (args.precision) {
    regex = `${regex}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    regex = `${regex}(\\.\\d+)?`;
  }
  return regex;
}
export function timeRegex(args: {
  offset?: boolean;
  local?: boolean;
  precision?: number | null;
}): RegExp {
  return new RegExp(`^${timeRegexSource(args)}$`);
}

// Adapted from https://stackoverflow.com/a/3143231
export function datetimeRegex(args: {
  precision?: number | null;
  offset?: boolean;
  local?: boolean;
}): RegExp {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;

  const opts: string[] = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset) opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}

export const stringRegex = (params?: { minimum?: number; maximum?: number }): RegExp => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};

export const bigintRegex: RegExp = /^\d+n?$/;
export const intRegex: RegExp = /^\d+$/;
export const numberRegex: RegExp = /^-?\d+(?:\.\d+)?/i;
export const booleanRegex: RegExp = /true|false/i;
export const nullRegex: RegExp = /null/i;
export const undefinedRegex: RegExp = /undefined/i;

// regex for string with no uppercase letters
export const lowercaseRegex: RegExp = /^[^A-Z]*$/;
// regex for string with no lowercase letters
export const uppercaseRegex: RegExp = /^[^a-z]*$/;
