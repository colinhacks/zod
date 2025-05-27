import * as z from "zod/v4-mini";

z;

const fn = (value: string) => Uint8Array.from(Buffer.from(value, "base64"));

// Argument of type 'ZodCustom<Uint8Array<ArrayBuffer>, unknown>' is not assignable to parameter of type '$ZodType<any, Uint8Array<ArrayBuffer>>'.
z.pipe(z.pipe(z.string(), z.transform(fn)), z.instanceof(Uint8Array));
