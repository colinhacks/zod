import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("type inference", () => {
  const schema = z.string().array();
  expectTypeOf<z.infer<typeof schema>>().toEqualTypeOf<string[]>();
});

test("url regex", () => {
  expect((z.url({ hostname: /^example\.com$/ }).safeParse("http://example.org/").error?.issues[0] as any).pattern).toBe(
    "^example\\.com$"
  );
});

test("bare IPv6 addresses are not valid URLs (#6031)", () => {
  const url = z.url();
  // The URL constructor mis-parses IPv6 addresses whose first group starts
  // with a hex letter (e.g. "fe80::1") as `scheme:opaque-path`; reject them.
  for (const addr of [
    "::1",
    "2001:db8::1",
    "fe80::1",
    "fe80::abcd:1234",
    "fe80:0000:0000:0000:0000:0000:0000:0001",
    "dead:beef:dead:beef:dead:beef:dead:beef",
  ]) {
    expect(url.safeParse(addr).success, addr).toBe(false);
  }

  // A bracketed IPv6 host inside a real URL stays valid; so do schemed URIs
  // whose opaque part happens to look hex-ish.
  for (const valid of ["http://[2001:db8::1]", "https://example.com", "c:", "mailto:foo@bar.com", "face:b00c"]) {
    expect(url.safeParse(valid).success, valid).toBe(true);
  }
});
