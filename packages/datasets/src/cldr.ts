export interface CodeMapping {
  alpha3: string;
  numeric: string;
}

interface CodeMappingsJson {
  supplemental: { codeMappings: Record<string, { _alpha3?: string; _numeric?: string }> };
}

// cldr-core/supplemental/codeMappings.json; only regions carrying both codes are kept, which drops the UN M49 areas
export function parseCodeMappings(json: unknown): Map<string, CodeMapping> {
  const mappings = (json as CodeMappingsJson).supplemental?.codeMappings;
  if (!mappings) throw new Error("the JSON is not the CLDR codeMappings file");
  const out = new Map<string, CodeMapping>();
  for (const [code, entry] of Object.entries(mappings)) {
    if (!entry._alpha3 || !entry._numeric) continue;
    if (!/^[A-Z]{3}$/.test(entry._alpha3) || !/^\d{3}$/.test(entry._numeric))
      throw new Error(`malformed CLDR mapping for ${code}: ${entry._alpha3} ${entry._numeric}`);
    out.set(code, { alpha3: entry._alpha3, numeric: entry._numeric });
  }
  return out;
}
