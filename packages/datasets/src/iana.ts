export interface IanaRecord {
  type: string;
  subtag: string;
  descriptions: string[];
  deprecated: string | undefined;
  scope: string | undefined;
}

export interface IanaRegistry {
  fileDate: string;
  records: IanaRecord[];
}

// RFC 5646 record-jar: records separated by %%, one `Key: value` per line, continuation lines indented by two spaces
export function parseRegistry(text: string): IanaRegistry {
  const chunks = text.replace(/\n {2}/g, " ").split(/^%%$/m);
  const fileDate = chunks[0]?.match(/^File-Date: (\d{4}-\d{2}-\d{2})/m)?.[1];
  if (!fileDate) throw new Error("the registry has no File-Date header");
  const records: IanaRecord[] = [];
  for (const chunk of chunks.slice(1)) {
    const fields = new Map<string, string[]>();
    for (const line of chunk.trim().split("\n")) {
      const at = line.indexOf(": ");
      if (at < 0) continue;
      const key = line.slice(0, at);
      fields.set(key, [...(fields.get(key) ?? []), line.slice(at + 2)]);
    }
    const one = (key: string) => fields.get(key)?.[0];
    const subtag = one("Subtag") ?? one("Tag");
    const type = one("Type");
    if (!subtag || !type) continue;
    records.push({
      type,
      subtag,
      descriptions: fields.get("Description") ?? [],
      deprecated: one("Deprecated"),
      scope: one("Scope"),
    });
  }
  return { fileDate, records };
}
