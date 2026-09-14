import { expect, test } from "vitest";
import { parseCodeMappings } from "./cldr.js";
import { readCodes, tuple } from "./emit.js";
import { parseRegistry } from "./iana.js";
import { parseListOne, parseListThree } from "./six.js";

test("iana registry", () => {
  const text = `File-Date: 2026-08-08\n%%\nType: language\nSubtag: bn\nDescription: Bengali\nDescription: Bangla\nAdded: 2005-10-16\n%%\nType: language\nSubtag: iw\nDescription: Hebrew\nAdded: 2005-10-16\nDeprecated: 1989-01-01\nPreferred-Value: he\n%%\nType: region\nSubtag: QM..QZ\nDescription: Private use\nAdded: 2005-10-16\n%%\nType: region\nSubtag: 001\nDescription: World\n  continued\nAdded: 2005-10-16\n`;
  const { fileDate, records } = parseRegistry(text);
  expect(fileDate).toBe("2026-08-08");
  expect(records.map((r) => r.subtag)).toEqual(["bn", "iw", "QM..QZ", "001"]);
  expect(records[0]).toMatchObject({ type: "language", descriptions: ["Bengali", "Bangla"], deprecated: undefined });
  expect(records[1]!.deprecated).toBe("1989-01-01");
  expect(records[3]!.descriptions).toEqual(["World continued"]);
  expect(() => parseRegistry("%%\nType: region\n")).toThrow("File-Date");
});

test("six lists", () => {
  const entry = (country: string, name: string, code: string, minor: string) =>
    `<CcyNtry><CtryNm>${country}</CtryNm>${name}<Ccy>${code}</Ccy><CcyNbr>978</CcyNbr><CcyMnrUnts>${minor}</CcyMnrUnts></CcyNtry>`;
  const listOne = (belgium: string) =>
    `<?xml version="1.0"?>\n<ISO_4217 Pblshd="2026-01-01"><CcyTbl><CcyNtry><CtryNm>ANTARCTICA</CtryNm><CcyNm>No universal currency</CcyNm></CcyNtry>${entry("CHILE", '<CcyNm IsFund="true">Unidad de Fomento</CcyNm>', "CLF", "4")}${entry("ZZ", "<CcyNm>Gold</CcyNm>", "XAU", "N.A.")}${entry("AUSTRIA", "<CcyNm>Euro</CcyNm>", "EUR", "2")}${entry("BELGIUM", "<CcyNm>Euro</CcyNm>", "EUR", belgium)}</CcyTbl></ISO_4217>`;
  const { published, currencies } = parseListOne(listOne("2"));
  expect(published).toBe("2026-01-01");
  expect(currencies).toEqual([
    { code: "CLF", numeric: "978", name: "Unidad de Fomento", minorUnits: 4, fund: true },
    { code: "EUR", numeric: "978", name: "Euro", minorUnits: 2, fund: false },
    { code: "XAU", numeric: "978", name: "Gold", minorUnits: null, fund: false },
  ]);
  expect(() => parseListOne(listOne("3"))).toThrow("EUR is listed with two different records");
  expect(() => parseListOne("<html>")).toThrow("publication date");
  const historic = (date: string) =>
    `<HstrcCcyNtry><CtryNm>A</CtryNm><CcyNm>Afghani</CcyNm><Ccy>AFA</Ccy><CcyNbr>004</CcyNbr><WthdrwlDt>${date}</WthdrwlDt></HstrcCcyNtry>`;
  const listThree = `<ISO_4217 Pblshd="2026-01-01"><HstrcCcyTbl>${historic("2001-05")}${historic("2003-01")}</HstrcCcyTbl></ISO_4217>`;
  expect(parseListThree(listThree).withdrawn).toEqual([
    { code: "AFA", numeric: "004", name: "Afghani", withdrawn: "2003-01" },
  ]);
});

test("cldr code mappings and the emitted tuple", () => {
  const mappings = parseCodeMappings({
    supplemental: { codeMappings: { US: { _numeric: "840", _alpha3: "USA" }, "001": { _numeric: "001" } } },
  });
  expect([...mappings]).toEqual([["US", { alpha3: "USA", numeric: "840" }]]);
  expect(() => parseCodeMappings({})).toThrow("codeMappings");
  expect(readCodes(tuple("codes", ["AD", "AE"]))).toEqual(["AD", "AE"]);
  expect(readCodes('export const codes = [\n  "AD",\n  "AE",\n] as const;')).toEqual(["AD", "AE"]);
  expect(readCodes("nothing here")).toBeUndefined();
});
