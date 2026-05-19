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

export type SearchEngine = "google" | "google_maps" | "google_local" | "google_shopping" | "google_news" | "bing" | "linkedin";

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
    case "linkedin": return searchLinkedIn(opts);
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

// ── LinkedIn Search (via Google site:linkedin.com) ────────────
async function searchLinkedIn(opts: SearchOptions): Promise<SearchResult[]> {
  if (!SERPAPI_KEY) return [];
  const q = opts.customQuery || `site:linkedin.com/in/ ${opts.role || "procurement OR purchasing OR buyer OR sourcing"} "${opts.product}" ${opts.market}`;

  const params = new URLSearchParams({
    engine: "google",
    q: q.trim(),
    api_key: SERPAPI_KEY,
    num: String(Math.min(opts.limit || 10, 30)),
    hl: "en",
  });

  const resp = await fetch(`${BASE}?${params}`);
  if (!resp.ok) return [];
  const data = await resp.json();

  const results: SearchResult[] = [];
  for (const item of (data.organic_results || []).slice(0, opts.limit || 10)) {
    const title = item.title || "";
    const snippet = item.snippet || "";
    // Extract name from LinkedIn profile title: "John Smith - Procurement Manager - Company | LinkedIn"
    const nameParts = title.split(" - ");
    const personName = nameParts[0]?.trim() || "";
    const role = nameParts[1]?.trim() || "";

    results.push({
      company_name: personName,
      website: item.link || "",
      description: `${role} | ${snippet.slice(0, 120)}`,
      match_score: scoreMatch(snippet + title, opts.product),
      source: "linkedin",
      link: item.link || "",
    });
  }
  return results;
}

// ── Buying Signals ────────────────────────────────────────────
export interface BuyingSignal {
  company_name: string;
  signal_type: string;    // "hiring", "funding", "expansion", "new_project", "trade_show"
  signal_strength: "strong" | "medium" | "weak";
  description: string;
  source_url: string;
  source_engine: string;
  match_score: number;
  recommendation: string;
}

export async function searchBuyingSignals(opts: {
  product: string;
  market: string;
  industry?: string;
}): Promise<BuyingSignal[]> {
  if (!SERPAPI_KEY) return mockBuyingSignals(opts);

  const allSignals: BuyingSignal[] = [];

  // Signal 1: Companies hiring (job postings = growing = potential buyer)
  try {
    const jobQuery = `site:linkedin.com/jobs/ ${opts.product} ${opts.market}`;
    const jobParams = new URLSearchParams({ engine: "google", q: jobQuery, api_key: SERPAPI_KEY, num: "5", hl: "en" });
    const jobResp = await fetch(`${BASE}?${jobParams}`);
    if (jobResp.ok) {
      const jobData = await jobResp.json();
      for (const item of (jobData.organic_results || []).slice(0, 5)) {
        allSignals.push({
          company_name: extractCompanyName(item.title || ""),
          signal_type: "hiring",
          signal_strength: "medium",
          description: `正在招聘 ${opts.product} 相关职位 — ${item.snippet?.slice(0, 100) || ""}`,
          source_url: item.link || "",
          source_engine: "linkedin_jobs",
          match_score: scoreMatch(item.snippet || "", opts.product),
          recommendation: "该公司正在扩招，可能有新的采购需求。建议发送合作提案。",
        });
      }
    }
  } catch {}

  // Signal 2: Company news (funding, expansion, new projects)
  try {
    const newsQuery = `${opts.product} ${opts.market} funding OR expansion OR "new facility" OR "new project"`;
    const newsParams = new URLSearchParams({ engine: "google_news", q: newsQuery, api_key: SERPAPI_KEY, num: "5", hl: "en" });
    const newsResp = await fetch(`${BASE}?${newsParams}`);
    if (newsResp.ok) {
      const newsData = await newsResp.json();
      for (const item of (newsData.news_results || []).slice(0, 5)) {
        const title = item.title || "";
        const isExpansion = /expand|new facility|new plant|new office|new warehouse/i.test(title);
        const isFunding = /funding|investment|series|raised|acquired/i.test(title);
        const signalType = isFunding ? "funding" : isExpansion ? "expansion" : "new_project";

        allSignals.push({
          company_name: item.source?.name || extractCompanyName(title),
          signal_type: signalType,
          signal_strength: isFunding ? "strong" : isExpansion ? "strong" : "medium",
          description: `${title} — ${item.snippet?.slice(0, 100) || ""}`,
          source_url: item.link || "",
          source_engine: "google_news",
          match_score: scoreMatch(title + " " + (item.snippet || ""), opts.product),
          recommendation: isFunding ? "获得融资后通常会扩大采购，建议立即联系。" : isExpansion ? "扩建设施意味着新的设备采购需求，建议跟进。" : "可能涉及新的采购需求，建议发送合作咨询。",
        });
      }
    }
  } catch {}

  // Signal 3: Trade shows / exhibitions
  try {
    const expoQuery = `${opts.industry || opts.product} trade show exhibition ${opts.market} 2026`;
    const expoParams = new URLSearchParams({ engine: "google", q: expoQuery, api_key: SERPAPI_KEY, num: "5", hl: "en" });
    const expoResp = await fetch(`${BASE}?${expoParams}`);
    if (expoResp.ok) {
      const expoData = await expoResp.json();
      for (const item of (expoData.organic_results || []).slice(0, 3)) {
        allSignals.push({
          company_name: extractCompanyName(item.title || ""),
          signal_type: "trade_show",
          signal_strength: "weak",
          description: `行业展会 — ${item.title || ""}`,
          source_url: item.link || "",
          source_engine: "google",
          match_score: 50,
          recommendation: "参展或参观此类展会可获取大量潜在客户。建议安排参展或派人参观。",
        });
      }
    }
  } catch {}

  // Deduplicate and sort by strength
  const seen = new Set<string>();
  const unique: BuyingSignal[] = [];
  for (const s of allSignals) {
    const key = s.company_name + s.signal_type;
    if (!seen.has(key)) { seen.add(key); unique.push(s); }
  }
  unique.sort((a, b) => {
    const order: Record<string, number> = { strong: 0, medium: 1, weak: 2 };
    return (order[a.signal_strength] || 2) - (order[b.signal_strength] || 2);
  });

  return unique.slice(0, 15);
}

function mockBuyingSignals(opts: { product: string; market: string; industry?: string }): BuyingSignal[] {
  return [
    { company_name: "TechVision Corp", signal_type: "funding", signal_strength: "strong", description: `TechVision Corp raises $50M Series B to expand ${opts.product} capabilities in ${opts.market}`, source_url: "", source_engine: "google_news", match_score: 85, recommendation: "获得融资后通常会扩大采购。建议立即联系采购部门。" },
    { company_name: "Metro Displays Inc", signal_type: "hiring", signal_strength: "medium", description: `Hiring Procurement Specialist for ${opts.product} division — ${opts.market}`, source_url: "", source_engine: "linkedin_jobs", match_score: 78, recommendation: "正在招采购专员，意味着有新的采购计划。建议发送开发信给 HR 或采购经理。" },
    { company_name: "Global Trade Partners", signal_type: "expansion", signal_strength: "strong", description: `Opening new distribution center in ${opts.market}, plans to expand ${opts.product} sourcing`, source_url: "", source_engine: "google_news", match_score: 82, recommendation: "新仓库意味着需要补充库存。建议提供产品目录和报价。" },
    { company_name: "BrightSign Solutions", signal_type: "hiring", signal_strength: "medium", description: `Looking for ${opts.product} supplier to support growing demand in ${opts.market}`, source_url: "", source_engine: "linkedin_jobs", match_score: 75, recommendation: "正在主动寻找供应商。建议发送样品和报价单。" },
    { company_name: "Digital Displays LLC", signal_type: "new_project", signal_strength: "medium", description: `Announced new ${opts.product} project for retail chain in ${opts.market}`, source_url: "", source_engine: "google_news", match_score: 70, recommendation: "新项目通常需要多个供应商。建议联系并提供竞争力报价。" },
    { company_name: `International ${opts.industry || "Trade"} Expo`, signal_type: "trade_show", signal_strength: "weak", description: `Major ${opts.product} trade show coming up in ${opts.market}`, source_url: "", source_engine: "google", match_score: 60, recommendation: "建议安排参展或派人参观，获取大量潜在客户。" },
  ];
}

function getGeoCode(market: string): string {
  const m: Record<string, string> = {
    "United States": "us", "Germany": "de", "United Kingdom": "gb", "Australia": "au",
    "Canada": "ca", "Japan": "jp", "France": "fr", "Brazil": "br", "UAE": "ae",
    "Saudi Arabia": "sa", "South Korea": "kr", "Mexico": "mx", "India": "in",
  };
  return m[market] || "us";
}
