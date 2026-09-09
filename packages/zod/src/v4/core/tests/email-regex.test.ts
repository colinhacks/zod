import { expect, test } from "vitest";

import { regexes } from "zod/v4/core";

// the lookahead form `regexes.email` had before this rewrite
const legacy = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

const table: [string, boolean][] = [
  ["a@b.cc", true],
  ["first.last@example.com", true],
  ["a.b.c.d@b.cc", true],
  ["'a@b.cc", true],
  ["a'b@b.cc", true],
  ["a+b@b.cc", true],
  ["a-@b.cc", true],
  ["a_@b.cc", true],
  ["a@0b.cc", true],
  ["a@b.c.dd", true],
  ["a@b-.cc", true],
  [".a@b.cc", false],
  ["a.@b.cc", false],
  ["a..b@b.cc", false],
  ["....@b.cc", false],
  ["a@b..cc", false],
  ["a@.b.cc", false],
  ["a@b.cc.", false],
  ["a'@b.cc", false],
  ["'@b.cc", false],
  ["@b.cc", false],
  ["a@b.c", false],
  ["a@b.c0", false],
  ["a@-b.cc", false],
  ["a@b.cc@d.ee", false],
  ["a b@b.cc", false],
  ["café@b.cc", false],
  ["😀@b.cc", false],
  ["a\0@b.cc", false],
  // `$` is not multiline, so no trailing terminator is tolerated
  ["a@b.cc\n", false],
  ["a@b.cc\r", false],
  ["\na@b.cc", false],
];

test("boundary cases", () => {
  for (const [input, expected] of table) {
    expect([input, regexes.email.test(input)]).toEqual([input, expected]);
    expect([input, legacy.test(input)]).toEqual([input, expected]);
  }
});

// one representative per character class the two grammars can tell apart
const classes = ["a", "0", "_", "'", "-", ".", "@", "!", "\n"];

test("exhaustive agreement over every string of length <= 6 in the class alphabet", () => {
  const idx: number[] = [];
  let accepted = 0;
  for (let len = 0; len <= 6; len++) {
    idx.length = len;
    idx.fill(0);
    for (;;) {
      let s = "";
      for (let i = 0; i < len; i++) s += classes[idx[i]!];
      const a = legacy.test(s);
      if (a !== regexes.email.test(s)) expect.unreachable(`disagreement on ${JSON.stringify(s)}`);
      if (a) accepted++;
      let p = len - 1;
      while (p >= 0 && ++idx[p]! === classes.length) idx[p--] = 0;
      if (p < 0) break;
    }
  }
  // 4 chars can precede `@`, 2 can open a domain label, 1 is a letter for the TLD
  expect(accepted).toBe(8);
});

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const local = "abZ09_'+-.".split("");
const domain = "abZ09-.".split("");
const hostile = ["@", ".", "..", "...", "\n", "\r", "\0", "\t", " ", '"', "é", "😀", "\\", "<", ";", "/", "{"];
const any = [...local, ...domain, ...hostile];

function fuzz(r: () => number): string {
  const pick = <T>(xs: T[]): T => xs[Math.floor(r() * xs.length)]!;
  const run = (xs: string[], max: number) => {
    let out = "";
    for (let i = Math.floor(r() * max); i > 0; i--) out += pick(xs);
    return out;
  };
  switch (Math.floor(r() * 8)) {
    case 0:
      return run(any, 40);
    case 1:
      return `${run(local, 24)}@${run(domain, 24)}`;
    case 2:
      return `${run(local, 8)}${".".repeat(1 + Math.floor(r() * 6))}${run(local, 8)}@${run(domain, 12)}`;
    case 3:
      return `${run(local, 8)}@${run(domain, 8)}${".".repeat(1 + Math.floor(r() * 6))}${run(domain, 8)}`;
    case 4: {
      // single-character mutation of a valid address
      const base = `${run("abZ09_'+-".split(""), 10)}@example.com`;
      const i = Math.floor(r() * base.length);
      return Math.floor(r() * 3) === 0
        ? base.slice(0, i) + pick(any) + base.slice(i)
        : base.slice(0, i) + (Math.floor(r() * 2) ? pick(any) : "") + base.slice(i + 1);
    }
    case 5:
      return (
        "a".repeat(1 + Math.floor(r() * 60)) +
        ".".repeat(Math.floor(r() * 4)) +
        run(local, 4) +
        (r() < 0.5 ? "@" : "") +
        run(domain, 10)
      );
    case 6:
      return `${run(local, 8)}@${run(domain, 6)}@${run(domain, 8)}`;
    default:
      return pick(["", "\n", " "]) + run(local, 8) + "@example.com" + pick(["", "\n", "\r\n", " ", "\0"]);
  }
}

test("differential fuzz", () => {
  const r = rng(0x5eed);
  let accepted = 0;
  for (let i = 0; i < 25_000; i++) {
    const s = fuzz(r);
    const a = legacy.test(s);
    if (a !== regexes.email.test(s)) expect.unreachable(`disagreement on ${JSON.stringify(s)}`);
    if (a) accepted++;
  }
  expect(accepted).toBeGreaterThan(500);
});
