export const cuidRegex: RegExp = /^c[^\s-]{8,}$/i;
export const cuid2Regex: RegExp = /^[0-9a-z]+$/;
export const ulidRegex: RegExp = /^[0-9A-HJKMNP-TV-Z]{26}$/;
export const xidRegex: RegExp = /^[0-9a-v]{20}$/i;
export const ksuidRegex: RegExp = /^[A-Za-z0-9]{27}$/;
export const nanoidRegex: RegExp = /^[a-z0-9_-]{21}$/i;
export const durationRegex: RegExp =
  /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
export const uuidRegex = (version?: number | undefined): RegExp => {
  if (!version)
    return /^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  return new RegExp(
    `^([0-9a-f]{8}-[0-9a-f]{4}-${version}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$`,
    "i"
  );
};
export const uuid4Regex: RegExp =
  /^([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
export const uuid6Regex: RegExp =
  /^([0-9a-f]{8}-[0-9a-f]{4}-6[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
export const emailRegex: RegExp =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;

// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
export const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
export function emojiRegex(): RegExp {
  return new RegExp(_emojiRegex, "u");
}

export const ipv4Regex: RegExp =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
export const ipv6Regex: RegExp =
  /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
export const ipRegex: RegExp = new RegExp(
  `(${ipv4Regex.source})|(${ipv6Regex.source})`
);

// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
export const base64Regex: RegExp =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

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

export const stringRegex: RegExp = /^[\s\S]*$/;
export const bigintRegex: RegExp = /\\-?\\d+/;
export const intRegex: RegExp = /\\-?\\d+/;
export const numberRegex: RegExp = /\\-?\\d+(?:\\.\\d+)?(?:e-?\\d+)?/i;
export const booleanRegex: RegExp = /true|false/i;
export const nullRegex: RegExp = /null/i;
export const undefinedRegex: RegExp = /undefined/i;
