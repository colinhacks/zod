const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const API_URL = "https://api.github.com/graphql";
const ATTEMPTS = 3;

// retries transient github failures (5xx, secondary rate limits) so one bad response doesn't fail the whole build
async function query(body: string): Promise<any> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body,
        next: { revalidate: 86400 }, // Cache for 1 day to match route revalidation
      });
      if (res.status >= 400) {
        throw new Error(`GitHub GraphQL responded ${res.status}: ${(await res.text()).slice(0, 500)}`);
      }
      const json = await res.json();
      if (json.errors) {
        throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors).slice(0, 500)}`);
      }
      return json;
    } catch (err) {
      lastError = err;
      console.error(`Failed to fetch GitHub stars (attempt ${attempt}/${ATTEMPTS}):`, err);
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    }
  }
  throw lastError;
}

export async function fetchStars(resources: { slug: string; stars?: number }[]) {
  try {
    if (resources.length === 0) return;
    const uniqueSlugs = Array.from(
      new Set(
        resources
          .filter((r) => r.stars === undefined)
          .map((r, id) => ({
            id,
            slug: r.slug,
          }))
      )
    );

    if (uniqueSlugs.length === 0) return;

    const queryParts = uniqueSlugs.map(({ id, slug }) => {
      const [owner, name] = slug.split("/");
      return `
      repo${id}: repository(owner: "${owner}", name: "${name}") {
        stargazerCount
      }
    `;
    });

    const json = await query(JSON.stringify({ query: `{ ${queryParts.join("\n")} }` }));

    // Create a map of slug → star count
    const starsMap = new Map<string, number>();
    for (const slug of uniqueSlugs) {
      const count = json.data[`repo${slug.id}`]?.stargazerCount;
      if (typeof count === "number") {
        starsMap.set(slug.slug, count);
      }
    }

    // Mutate in-place
    for (const r of resources) {
      r.stars = starsMap.get(r.slug);
    }

    // sort by star coun (descending) in place
    resources.sort((a, b) => (b.stars || 0) - (a.stars || 0));
  } catch (_) {
    // dev renders "—" without a token; production fails the build so a deploy never ships a starless ecosystem page
    if (process.env.NODE_ENV === "production") {
      throw new Error("Failed to fetch GitHub stars");
    }
  }
}
