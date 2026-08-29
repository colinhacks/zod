import semver from "semver";

// every zod release from 4.5.0 on must have an @zod/mini twin on npm, and every @zod/mini 4.x must have a zod twin; latest must agree. `--wait` retries for up to ~6 minutes, since the packument endpoint is CDN-cached for five
const FLOOR = "4.5.0";
const attempts = process.argv.includes("--wait") ? 13 : 1;

async function releases(name: string): Promise<{ versions: string[]; latest: string }> {
  const res = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2f")}`, {
    headers: { accept: "application/vnd.npm.install-v1+json" },
  });
  if (!res.ok) throw new Error(`npm registry ${res.status} for ${name}`);
  const body = (await res.json()) as { versions: Record<string, unknown>; "dist-tags": Record<string, string> };
  const versions = Object.keys(body.versions).filter(
    (v) => semver.valid(v) && !semver.prerelease(v) && semver.gte(v, FLOOR)
  );
  return { versions, latest: body["dist-tags"].latest };
}

async function problems(): Promise<string[]> {
  const [zod, mini] = await Promise.all([releases("zod"), releases("@zod/mini")]);
  const missingMini = zod.versions.filter((v) => !mini.versions.includes(v)).sort(semver.compare);
  const strayMini = mini.versions.filter((v) => !zod.versions.includes(v)).sort(semver.compare);
  const out: string[] = [];
  if (missingMini.length) out.push(`zod versions with no @zod/mini twin: ${missingMini.join(", ")}`);
  if (strayMini.length) out.push(`@zod/mini versions with no zod twin: ${strayMini.join(", ")}`);
  if (zod.latest !== mini.latest) out.push(`latest differs: zod@${zod.latest} vs @zod/mini@${mini.latest}`);
  if (!out.length) {
    console.log(
      `✅ zod and @zod/mini are in lockstep on npm (${zod.versions.length} versions since ${FLOOR}, latest ${zod.latest})`
    );
  }
  return out;
}

let found = await problems();
for (let i = 1; i < attempts && found.length; i++) {
  console.log(`   not yet in lockstep (${found.join("; ")}); retrying in 30s (${i}/${attempts - 1})`);
  await new Promise((r) => setTimeout(r, 30_000));
  found = await problems();
}
if (found.length) {
  console.error(`❌ zod and @zod/mini are out of lockstep on npm:`);
  for (const p of found) console.error(`   ${p}`);
  process.exit(1);
}
