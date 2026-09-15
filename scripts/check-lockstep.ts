import semver from "semver";

// every zod release from 4.5.0 on must have an @zod/mini twin on npm and on JSR, and every @zod/mini 4.x must have a zod twin; latest must agree. `--wait` retries for up to ~6 minutes, since the npm packument endpoint is CDN-cached for five
const FLOOR = "4.5.0";
const attempts = process.argv.includes("--wait") ? 13 : 1;

type Releases = { name: string; versions: string[]; latest: string };

function stable(versions: string[]): string[] {
  return versions.filter((v) => semver.valid(v) && !semver.prerelease(v) && semver.gte(v, FLOOR));
}

async function npmReleases(name: string): Promise<Releases> {
  const res = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2f")}`, {
    headers: { accept: "application/vnd.npm.install-v1+json" },
  });
  if (!res.ok) throw new Error(`npm registry ${res.status} for ${name}`);
  const body = (await res.json()) as { versions: Record<string, unknown>; "dist-tags": Record<string, string> };
  return { name, versions: stable(Object.keys(body.versions)), latest: body["dist-tags"].latest };
}

// a 404 means the package has no versions on JSR yet
async function jsrReleases(name: string): Promise<Releases> {
  const res = await fetch(`https://jsr.io/${name}/meta.json`);
  if (res.status === 404) return { name: `jsr:${name}`, versions: [], latest: "" };
  if (!res.ok) throw new Error(`jsr ${res.status} for ${name}`);
  const body = (await res.json()) as { versions: Record<string, unknown>; latest: string };
  return { name: `jsr:${name}`, versions: stable(Object.keys(body.versions)), latest: body.latest };
}

function twins(a: Releases, b: Releases): string[] {
  const out: string[] = [];
  const missing = a.versions.filter((v) => !b.versions.includes(v)).sort(semver.compare);
  const stray = b.versions.filter((v) => !a.versions.includes(v)).sort(semver.compare);
  if (missing.length) out.push(`${a.name} versions with no ${b.name} twin: ${missing.join(", ")}`);
  if (stray.length) out.push(`${b.name} versions with no ${a.name} twin: ${stray.join(", ")}`);
  if (a.latest !== b.latest) out.push(`latest differs: ${a.name}@${a.latest} vs ${b.name}@${b.latest}`);
  return out;
}

async function problems(): Promise<string[]> {
  const [zod, mini, jsrZod, jsrMini] = await Promise.all([
    npmReleases("zod"),
    npmReleases("@zod/mini"),
    jsrReleases("@zod/zod"),
    jsrReleases("@zod/mini"),
  ]);
  const out = [...twins(zod, mini), ...twins(jsrZod, jsrMini)];
  // npm is the source of truth and JSR follows it; a gap here is reported, not fatal, because that publish is recovered by hand and must not hold a release red
  for (const gap of twins(zod, jsrZod)) console.warn(`⚠️  ${gap}`);
  if (!out.length) {
    console.log(
      `✅ zod and @zod/mini are in lockstep on npm and JSR (${zod.versions.length} versions since ${FLOOR}, latest ${zod.latest})`
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
  console.error(`❌ zod and @zod/mini are out of lockstep:`);
  for (const p of found) console.error(`   ${p}`);
  process.exit(1);
}
