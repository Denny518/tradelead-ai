const SERPAPI_KEY = process.env.SERPAPI_KEY || "";
const BASE = "https://serpapi.com/search.json";

export interface SearchResult {
  company_name: string;
  website: string;
  description: string;
  match_score: number;
  source?: string;       // "google", "google_maps", "google_local", "google_shopping", "google_news", "bing"
  phone?: string;
  address?: string;
  rating?: number;
  reviews_count?: number;
  price?: string;
  link?: string;
}

export type SearchEngine = "google" | "google_maps" | "google_local" | "google_shopping" | "google_news" | "bing";

interface SearchOptions {
  engine: SearchEngine;
  product: string;
  market: string;
  industry?: string;
  limit?: number;
  role?: string;
  companyType?: string;
  customQuery?: string;
  excludeKeywords?: string;
  // Maps-specific
  mapsLocation?: string;    // e.g. "Los Angeles, CA"
  mapsRadius?: string;       // e.g. "50km"
  // Shopping-specific
  shoppingPriceRange?: string; // e.g. "50-200"
  // News-specific
  newsTimeframe?: string;   // "d", "w", "m", "y"
  // Bing-specific
  bingMarket?: string;      // e.g. "en-US"
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch { return url; }
}

function extractCompanyName(title: string): string {
  for (const sep of [" - ", " | ", " – ", " · "]) {
    if (title.includes(sep)) return title.split(sep)[0].trim();
  }
  return title.trim();
}

function scoreMatch(text: string, product: string): number {
  let score = 50;
  const lower = text.toLowerCase();
  for (const kw of product.toLowerCase().split(/\s+/)) {
    if (lower.includes(kw)) score += 10;
  }
  if (/distributor|wholesaler|importer|retailer|supplier|dealer|store/i.test(lower)) score += 15;
  return Math.min(score, 99);
}

// ── Helper: extract real website from various Maps/Local fields ──
function extractWebsite(item: any): string {
  // Priority 1: Direct website field (company's actual URL)
  if (item.website && !item.website.includes("google.com") && !item.website.includes("maps/place")) {
    return item.website;
  }
  // Priority 2: Some results have website_link
  if (item.website_link && !item.website_link.includes("google.com")) {
    return item.website_link;
  }
  // Priority 3: Check if "link" is actually a company website, not a maps link
  if (item.link && !item.link.includes("google.com/maps") && !item.link.includes("maps/place")) {
    return item.link;
  }
  return "";
}

// ── Try to find website via quick Google search ────────────────
export async function findCompanyWebsite(companyName: string, location?: string): Promise<string | null> {
  if (!SERPAPI_KEY) return null;
  const q = `${companyName} ${location || ""} official website`.trim();
  const params = new URLSearchParams({
    engine: "google",
    q,
    api_key: SERPAPI_KEY,
    num: "1",
    hl: "en",
  });
  try {
    const resp = await fetch(`${BASE}?${params}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const firstLink = data.organic_results?.[0]?.link;
    if (firstLink) {
      try { return new URL(firstLink).hostname.replace(/^www\./, ""); } catch { return firstLink; }
    }
  } catch {}
  return null;
}

// ── Google Local Search ────────────────────────────────────────
async function searchLocal(opts: SearchOptions): Promise<SearchResult[]> {
  if (!SERPAPI_KEY) return [];
  const q = opts.customQuery || `${opts.product} ${opts.companyType || "distributor OR wholesaler OR retailer"} near ${opts.mapsLocation || opts.market}`;

  const params = new URLSearchParams({
    engine: "google_local",
    q: q.trim(),
    api_key: SERPAPI_KEY,
    hl: "en",
    gl: getGeoCode(opts.market),
  });
  if (opts.mapsLocation) params.set("location", opts.mapsLocation);

  const resp = await fetch(`${BASE}?${params}`);
  if (!resp.ok) return [];
  const data = await resp.json();

  const results: SearchResult[] = [];
  const allItems = [...(data.local_results || []), ...(data.ads_results || []), ...(data.discover_more_places || [])];

  for (const item of allItems.slice(0, opts.limit || 10)) {
    if (!item) continue;
    const name = item.title || item.name || "";
    const desc = [item.type, item.description, item.category, ...(item.types || [])].filter(Boolean).join(" | ");
    const phone = item.phone || item.phone_number || "";
    const address = item.address || item.full_address || "";
    // Extract real website, not Google Maps URL
    const website = extractWebsite(item);

    results.push({
      company_name: name,
      website,
      description: desc || `Local business: ${address}. ${item.snippet || ""}`,
      match_score: scoreMatch(desc + " " + name + " " + (item.snippet || ""), opts.product),
      source: "google_local",
      phone,
      address,
      rating: item.rating || item.reviews_rating || 0,
      reviews_count: item.reviews || item.reviews_count || item.reviews_total || 0,
      link: item.maps_link || item.link || "",
    });
  }
  return results;
}

// ── Google Maps Search ────────────────────────────────────────
async function searchMaps(opts: SearchOptions): Promise<SearchResult[]> {
  if (!SERPAPI_KEY) return [];
  const q = opts.customQuery || `${opts.product} ${opts.companyType || "distributor OR retailer OR wholesaler"}${opts.role ? ` ${opts.role}` : ""}`;

  const params = new URLSearchParams({
    engine: "google_maps",
    q: q.trim(),
    type: "search",
    api_key: SERPAPI_KEY,
    hl: "en",
  });
  if (opts.mapsLocation) params.set("location", opts.mapsLocation);

  const resp = await fetch(`${BASE}?${params}`);
  if (!resp.ok) return [];
  const data = await resp.json();
  const localResults = data.local_results || data.place_results ? [data.place_results] : [];
  const results: SearchResult[] = [];

  for (const item of [...(data.local_results || []), ...localResults].slice(0, opts.limit || 10)) {
    if (!item) continue;
    const name = item.title || item.name || "";
    const desc = [item.type, item.description, ...(item.types || [])].filter(Boolean).join(" | ");
    const website = extractWebsite(item);

    results.push({
      company_name: name,
      website,
      description: desc || `${item.address || ""}`,
      match_score: scoreMatch(desc + name, opts.product),
      source: "google_maps",
      phone: item.phone || "",
      address: item.address || item.full_address || "",
      rating: item.rating || 0,
      reviews_count: item.reviews || 0,
    });
  }
  return results;
}

// ── Google Shopping Search ────────────────────────────────────
async function searchShopping(opts: SearchOptions): Promise<SearchResult[]> {
  if (!SERPAPI_KEY) return [];
  const q = opts.customQuery || `${opts.product}`;

  const params = new URLSearchParams({
    engine: "google_shopping",
    q: q.trim(),
    api_key: SERPAPI_KEY,
    hl: "en",
    gl: getGeoCode(opts.market),
  });
  if (opts.shoppingPriceRange) params.set("tbs", `price:1,ppr_min:${opts.shoppingPriceRange.split("-")[0]},ppr_max:${opts.shoppingPriceRange.split("-")[1] || ""}`);

  const resp = await fetch(`${BASE}?${params}`);
  if (!resp.ok) return [];
  const data = await resp.json();

  const results: SearchResult[] = [];
  for (const item of (data.shopping_results || []).slice(0, opts.limit || 10)) {
    const seller = item.seller || item.source || "";
    results.push({
      company_name: seller,
      website: item.link || "",
      description: `${item.title || ""} — Price: ${item.extracted_price || item.price || "N/A"}`,
      match_score: scoreMatch((item.title || "") + " " + seller, opts.product),
      source: "google_shopping",
      price: item.extracted_price || item.price || "",
      link: item.link || "",
      rating: item.rating || 0,
      reviews_count: item.reviews || 0,
    });
  }
  return results;
}

// ── Google News Search ────────────────────────────────────────
async function searchNews(opts: SearchOptions): Promise<SearchResult[]> {
  if (!SERPAPI_KEY) return [];
  const q = opts.customQuery || `${opts.product} ${opts.companyType || "company OR business"} ${opts.market}`;

  const params = new URLSearchParams({
    engine: "google_news",
    q: q.trim(),
    api_key: SERPAPI_KEY,
    hl: "en",
    gl: getGeoCode(opts.market),
  });

  const resp = await fetch(`${BASE}?${params}`);
  if (!resp.ok) return [];
  const data = await resp.json();

  const results: SearchResult[] = [];
  for (const item of (data.news_results || []).slice(0, opts.limit || 10)) {
    const source = item.source?.name || item.source || "";
    const title = item.title || "";
    results.push({
      company_name: source,
      website: item.link || "",
      description: `${title} — ${item.snippet || ""}`.slice(0, 200),
      match_score: scoreMatch(title + " " + (item.snippet || ""), opts.product),
      source: "google_news",
      link: item.link || "",
    });
  }
  return results;
}

// ── Bing Search ───────────────────────────────────────────────
async function searchBing(opts: SearchOptions): Promise<SearchResult[]> {
  if (!SERPAPI_KEY) return [];
  const q = opts.customQuery || `"${opts.product}" ${opts.companyType || "distributor OR importer OR wholesaler"} in ${opts.market} ${opts.industry || ""}`;

  const params = new URLSearchParams({
    engine: "bing",
    q: q.trim(),
    api_key: SERPAPI_KEY,
    cc: opts.bingMarket || getGeoCode(opts.market),
    count: String(Math.min(opts.limit || 10, 50)),
  });

  const resp = await fetch(`${BASE}?${params}`);
  if (!resp.ok) return [];
  const data = await resp.json();

  const results: SearchResult[] = [];
  for (const item of (data.organic_results || []).slice(0, opts.limit || 10)) {
    results.push({
      company_name: extractCompanyName(item.title || ""),
      website: item.link || "",
      description: item.snippet || "",
      match_score: scoreMatch(item.snippet || "", opts.product),
      source: "bing",
    });
  }
  return results;
}

// ── Main Router ───────────────────────────────────────────────
export async function multiSearch(opts: SearchOptions): Promise<SearchResult[]> {
  switch (opts.engine) {
    case "google_maps": return searchMaps(opts);
    case "google_local": return searchLocal(opts);
    case "google_shopping": return searchShopping(opts);
    case "google_news": return searchNews(opts);
    case "bing": return searchBing(opts);
    default: return [];
  }
}

// ── Multi-engine parallel search ─────────────────────────────
export async function searchAllEngines(opts: Omit<SearchOptions, "engine">): Promise<Record<string, SearchResult[]>> {
  const engines: SearchEngine[] = ["google", "google_maps", "google_local", "google_news", "bing"];
  const results: Record<string, SearchResult[]> = {};

  await Promise.all(
    engines.map(async (engine) => {
      try {
        results[engine] = await multiSearch({ ...opts, engine });
      } catch {
        results[engine] = [];
      }
    })
  );

  return results;
}

function getGeoCode(market: string): string {
  const m: Record<string, string> = {
    "United States": "us", "Germany": "de", "United Kingdom": "gb", "Australia": "au",
    "Canada": "ca", "Japan": "jp", "France": "fr", "Brazil": "br", "UAE": "ae",
    "Saudi Arabia": "sa", "South Korea": "kr", "Mexico": "mx", "India": "in",
  };
  return m[market] || "us";
}
