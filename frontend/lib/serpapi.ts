const SERPAPI_KEY = process.env.SERPAPI_KEY || "";
const SERPAPI_URL = "https://serpapi.com/search.json";

export interface SearchResult {
  company_name: string;
  website: string;
  description: string;
  match_score: number;
}

function extractCompanyName(title: string): string {
  for (const sep of [" - ", " | ", " – ", " · "]) {
    if (title.includes(sep)) return title.split(sep)[0].trim();
  }
  return title.trim();
}

function scoreMatch(snippet: string, product: string): number {
  let score = 50;
  const snippetLower = snippet.toLowerCase();
  for (const kw of product.toLowerCase().split(/\s+/)) {
    if (snippetLower.includes(kw)) score += 10;
  }
  if (/distributor|wholesaler|importer/i.test(snippetLower)) score += 15;
  return Math.min(score, 99);
}

interface SearchOptions {
  product: string;
  market: string;
  industry?: string;
  limit?: number;
  role?: string;
  companyType?: string;
  customQuery?: string;
  excludeKeywords?: string;
}

export async function searchCustomers(opts: SearchOptions): Promise<SearchResult[]> {
  const { product, market, industry = "", limit = 10, role = "", companyType = "", customQuery = "", excludeKeywords = "" } = opts;

  if (!SERPAPI_KEY) return mockSearch(product, market, industry, limit);

  // Build query from advanced options
  let query: string;
  if (customQuery) {
    query = customQuery;
  } else {
    const parts: string[] = [];
    parts.push(`"${product}"`);
    if (companyType) parts.push(companyType);
    else parts.push("distributor OR importer OR wholesaler");
    if (role) parts.push(role);
    parts.push(`in ${market}`);
    if (industry) parts.push(industry);
    if (excludeKeywords) {
      const excludes = excludeKeywords.split(",").map((k) => `-${k.trim()}`).join(" ");
      parts.push(excludes);
    }
    query = parts.join(" ");
  }

  const geoMap: Record<string, string> = {
    "United States": "us", "Germany": "de", "United Kingdom": "gb", "Australia": "au",
    "Canada": "ca", "Japan": "jp", "France": "fr", "Brazil": "br", "UAE": "ae",
    "Saudi Arabia": "sa", "South Korea": "kr", "Mexico": "mx", "India": "in",
  };

  const params = new URLSearchParams({
    engine: "google",
    q: query.trim(),
    api_key: SERPAPI_KEY,
    num: String(Math.min(limit, 50)),
    gl: geoMap[market] || "us",
    hl: "en",
  });

  const resp = await fetch(`${SERPAPI_URL}?${params}`);
  if (!resp.ok) throw new Error(`SerpAPI error: ${resp.status}`);
  const data = await resp.json();

  const results: SearchResult[] = [];
  for (const item of (data.organic_results || []).slice(0, limit)) {
    results.push({
      company_name: extractCompanyName(item.title || ""),
      website: item.link || "",
      description: item.snippet || "",
      match_score: scoreMatch(item.snippet || "", product),
    });
  }
  return results;
}

const MOCK_DATA: Record<string, Array<[string, string, string]>> = {
  "LED显示屏": [
    ["ABC Displays Inc.", "https://www.abcleddisplays.com", "Leading LED display distributor in the US, specializing in outdoor advertising screens and stadium displays."],
    ["Digital Signage Pro", "https://www.digitalsignagepro.com", "Full-service digital signage company offering LED video walls for retail and corporate clients."],
    ["BrightView LED Solutions", "https://www.brightviewled.com", "Importer and distributor of commercial-grade LED display panels for events and exhibitions."],
    ["Pixel Perfect Displays", "https://www.pixelperfectdisplays.com", "Wholesale LED screen supplier serving the North American market since 2010."],
    ["Sunset Visual Technologies", "https://www.sunsetvisual.com", "Custom LED display solutions for entertainment venues, churches, and sports facilities."],
    ["Metro Digital Boards", "https://www.metrodigitalboards.com", "NYC-based distributor of indoor and outdoor LED advertising screens."],
    ["Coastal Signage Systems", "https://www.coastalsignage.com", "West coast importer of energy-efficient LED displays with installation services."],
    ["Premier AV Solutions", "https://www.premieravsolutions.com", "Audiovisual integrator specializing in large-format LED display installations."],
    ["TechVision Displays", "https://www.techvisiondisplays.com", "Distributor of cutting-edge fine-pitch LED displays for corporate environments."],
    ["Global Sign Importers", "https://www.globalsignimporters.com", "Direct importer of LED modules and complete display systems from Asia."],
  ],
};

const DEFAULT_MOCK: Array<[string, string, string]> = [
  ["Acme Trading Co.", "https://www.acmetrading.com", "Established distributor serving wholesale and retail channels."],
  ["Global Import Solutions", "https://www.globalimportsolutions.com", "Specialized importer with strong market presence."],
  ["Premier Distribution Inc.", "https://www.premierdistribution.com", "Top-tier distributor of related products."],
  ["Market Leader Wholesale", "https://www.marketleaderwholesale.com", "Leading wholesale supplier with extensive inventory."],
  ["First Choice Imports", "https://www.firstchoiceimports.com", "Reliable source serving businesses since 1998."],
  ["Direct Source Trading", "https://www.directsourcetrading.com", "Direct importer and B2B supplier across the region."],
  ["ProSupply Group", "https://www.prosupplygroup.com", "Professional distributor with competitive pricing and fast shipping."],
  ["Alliance Trade Partners", "https://www.alliancetradepartners.com", "Strategic trade partner for product distribution."],
];

function mockSearch(product: string, market: string, industry = "", limit = 10): SearchResult[] {
  const source = MOCK_DATA[product] || DEFAULT_MOCK;
  return source.slice(0, limit).map((item, i) => ({
    company_name: item[0],
    website: item[1],
    description: item[2],
    match_score: 88 - i * 3,
  }));
}
